#==============================================================================
# Runtime game data — party, dex, cosmetics, inventory (mirrors web mechanics)
#==============================================================================
module Routewild
  class CreatureSpecies
    attr_reader :id, :name, :type, :area, :catch_rate, :weight, :base, :desc, :battler, :moves
    def initialize(hash)
      @id = hash["internal"]
      @name = hash["name"]
      @type = hash["type"]
      @area = hash["area"]
      @catch_rate = hash["catch"]
      @weight = hash["weight"]
      @base = hash["base"]
      @desc = hash["desc"]
      @battler = hash["battler"]
      @moves = hash["moves"]
    end
  end

  class PartyMember
    attr_accessor :uid, :id, :level, :xp, :hp, :max_hp, :skills, :skill_points, :status
    def initialize(species_id, level = 5)
      @uid = "#{species_id}-#{rand(99999)}"
      @id = species_id
      @level = level
      @xp = 0
      @skills = { "hp" => 0, "atk" => 0, "def" => 0, "spd" => 0 }
      @skill_points = 1
      @status = nil
      refresh_stats
      @hp = @max_hp
    end

    def species
      Data.species_by_id(@id)
    end

    def refresh_stats
      sp = species
      return unless sp
      ratio = (@max_hp && @max_hp > 0) ? (@hp.to_f / @max_hp) : 1.0
      @max_hp = (sp.base["hp"] + @level * 4.2 + (@skills["hp"] || 0) * 3).round
      @hp = [[(@max_hp * ratio).round, 0].max, @max_hp].min
    end

    def atk; GameMath.stat(species.base["atk"], @level, @skills["atk"]); end
    def defense; GameMath.stat(species.base["def"], @level, @skills["def"]); end
    def spd; GameMath.stat(species.base["spd"], @level, @skills["spd"]); end

    def spend_skill(key)
      return false if @skill_points <= 0
      return false unless ["hp","atk","def","spd"].include?(key)
      @skills[key] += 1
      @skill_points -= 1
      refresh_stats
      @hp = [@max_hp, @hp + 3].min if key == "hp"
      true
    end
  end

  module GameMath
    module_function
    def xp_to_next(level); 12 + level * 10; end
    def stat(base, level, bonus = 0); (base + level * 2.1 + bonus * 2).round; end

    def type_mult(move_type, target_type)
      row = Data.type_chart[move_type]
      return 1.0 unless row
      row[target_type] || 1.0
    end

    def damage(atk, defense, move, move_type, def_type, atk_mod = 1.0, def_mod = 1.0)
      mult = type_mult(move_type, def_type)
      raw = move["power"] + atk * 0.55 * atk_mod - defense * 0.3 * def_mod
      variance = 0.85 + rand * 0.3
      dmg = [(raw * mult * variance).round, 3].max
      [dmg, mult]
    end

    def catch_chance(species, hp_ratio)
      [0.92, species.catch_rate + (1.0 - hp_ratio) * 0.35].min
    end
  end

  module Data
    @species = []
    @species_by_id = {}
    @maps = {}
    @type_chart = {}

    class << self
      attr_reader :species, :maps, :type_chart
      def load_all
        @species = PBS.load_creatures.map { |h| CreatureSpecies.new(h) }
        @species_by_id = {}
        @species.each { |s| @species_by_id[s.id] = s }
        @maps = PBS.load_world
        @type_chart = PBS.load_type_chart
      end
      def species_by_id(id); @species_by_id[id]; end
      def species_for_area(area); @species.select { |s| s.area == area }; end
      def roll_wild(area)
        pool = species_for_area(area)
        return @species[0] if pool.empty?
        total = pool.inject(0) { |s, c| s + c.weight }
        r = rand(total)
        pool.each do |c|
          r -= c.weight
          return c if r < 0
        end
        pool[-1]
      end
    end
  end

  class GameState
    attr_accessor :money, :inventory, :party, :storage, :dex
    attr_accessor :cosmetics, :battles_won, :map_id, :player_x, :player_y, :facing
    attr_accessor :outfit, :accessory

    def initialize
      @money = Config::START_MONEY
      @inventory = { "orb" => Config::START_ORBS, "potion" => Config::START_POTIONS, "hi_potion" => 0 }
      @party = []
      @storage = []
      @dex = {}
      @cosmetics = {
        "outfits" => ["cloak_pink"],
        "accessories" => ["clip_sakura"],
        "achievements" => []
      }
      @outfit = "cloak_pink"
      @accessory = "clip_sakura"
      @battles_won = 0
      @map_id = "town"
      @player_x = 10
      @player_y = 12
      @facing = 2 # down
    end

    def lead
      @party.find { |m| m.hp > 0 } || @party[0]
    end

    def start_with!(starter_id)
      @party = [PartyMember.new(starter_id, 5)]
      @dex[starter_id] = true
      @map_id = "town"
      @player_x = 10
      @player_y = 12
    end
  end
end
