#==============================================================================
# Wild battle — Fight / Catch / Item / Flee with status effects & move details
#==============================================================================
class Scene_RoutewildBattle
  def main
    @state = $routewild
    @ally = @state.lead
    unless @ally && @ally.hp > 0
      $scene = Scene_RoutewildMap.new
      return
    end
    species = Routewild::Data.roll_wild(@state.map_id)
    @wild = {
      "species" => species,
      "level" => [3, @ally.level + rand(3) - 1].max,
      "hp" => 0, "max_hp" => 0, "status" => nil
    }
    @wild["max_hp"] = (species.base["hp"] + @wild["level"] * 4.2).round
    @wild["hp"] = @wild["max_hp"]
    @busy = false
    @phase = :menu # :menu :moves
    @move_index = 0
    @log = "A wild #{species.name} appeared!"
    create
    Routewild::AudioHub.play_bgm("battle")
    Routewild::AudioHub.se("Cry")
    Graphics.transition
    loop do
      Graphics.update
      Input.update
      update
      break if $scene != self
    end
    dispose
  end

  def create
    @viewport = Viewport.new(0, 0, 640, 480)
    @sprites = []
    @bg = Sprite.new(@viewport)
    begin
      @bg.bitmap = Bitmap.new("Graphics/Battlebacks/battle")
    rescue
      @bg.bitmap = Bitmap.new(640, 480)
      @bg.bitmap.fill_rect(0, 0, 640, 480, Color.new(240, 200, 210))
    end
    @sprites << @bg

    @foe = Sprite.new(@viewport)
    begin
      @foe.bitmap = Bitmap.new("Graphics/Battlers/#{@wild["species"].battler}")
    rescue
      @foe.bitmap = Bitmap.new(160, 160)
    end
    @foe.zoom_x = @foe.zoom_y = 0.9
    @foe.x = 380
    @foe.y = 40
    @sprites << @foe

    @ally_sp = Sprite.new(@viewport)
    begin
      @ally_sp.bitmap = Bitmap.new("Graphics/Battlers/#{@ally.id}")
    rescue
      @ally_sp.bitmap = Bitmap.new(160, 160)
    end
    @ally_sp.zoom_x = @ally_sp.zoom_y = 0.75
    @ally_sp.x = 40
    @ally_sp.y = 180
    @sprites << @ally_sp

    @ui = Sprite.new(@viewport)
    @ui.z = 50
    refresh_ui
    @sprites << @ui
  end

  def refresh_ui
    bmp = Bitmap.new(640, 480)
    bmp.font.size = 16
    bmp.font.color = Color.new(74, 42, 50)
    # foe box
    bmp.fill_rect(360, 8, 260, 70, Color.new(255, 248, 251, 220))
    st = @wild["status"] ? " [#{@wild["status"]["id"]}]" : ""
    bmp.draw_text(370, 12, 240, 22, "#{@wild["species"].name} Lv#{@wild["level"]}#{st}")
    draw_bar(bmp, 370, 40, 220, @wild["hp"], @wild["max_hp"])
    # ally box
    bmp.fill_rect(20, 300, 280, 70, Color.new(255, 248, 251, 220))
    ast = @ally.status ? " [#{@ally.status["id"]}]" : ""
    bmp.draw_text(30, 304, 260, 22, "#{@ally.species.name} Lv#{@ally.level}#{ast}")
    draw_bar(bmp, 30, 332, 220, @ally.hp, @ally.max_hp)
    # log
    bmp.fill_rect(20, 380, 600, 36, Color.new(255, 248, 251, 230))
    bmp.draw_text(28, 386, 584, 24, @log)
    # actions
    bmp.fill_rect(20, 424, 600, 48, Color.new(255, 240, 245, 235))
    if @phase == :menu
      bmp.draw_text(30, 436, 580, 24, "Z Fight   Shift Catch   L/R Item   X Flee")
    else
      moves = @ally.species.moves
      moves.each_with_index do |m, i|
        mark = (i == @move_index) ? ">" : " "
        meta = "#{m["power"]} #{m["type"]}"
        meta += " +#{m["effect"]["id"]}" if m["effect"]
        bmp.draw_text(30 + (i % 2) * 300, 430 + (i / 2) * 20, 290, 20, "#{mark} #{m["name"]} (#{meta})")
      end
    end
    @ui.bitmap.dispose if @ui.bitmap
    @ui.bitmap = bmp
  end

  def draw_bar(bmp, x, y, w, hp, max)
    bmp.fill_rect(x, y, w, 12, Color.new(200, 180, 190))
    pw = max > 0 ? (w * hp / max) : 0
    col = hp * 100 / [max, 1].max < 35 ? Color.new(220, 100, 90) : Color.new(120, 190, 130)
    bmp.fill_rect(x, y, pw, 12, col)
  end

  def status_atk_mod(fighter)
    id = fighter.is_a?(Hash) ? (fighter["status"] && fighter["status"]["id"]) : (fighter.status && fighter.status["id"])
    return 0.85 if id == "thorns"
    return 1.2 if id == "focus"
    return 0.9 if id == "burn"
    1.0
  end

  def status_def_mod(fighter)
    id = fighter.is_a?(Hash) ? (fighter["status"] && fighter["status"]["id"]) : (fighter.status && fighter.status["id"])
    return 0.85 if id == "wet"
    return 1.2 if id == "ward"
    1.0
  end

  def try_effect(move, user_member, target_hash, user_is_ally)
    return nil unless move["effect"]
    return nil if rand > move["effect"]["chance"]
    id = move["effect"]["id"]
    turns = move["effect"]["turns"] || 3
    self_buff = ["glow", "focus", "ward"].include?(id)
    if self_buff
      if user_is_ally
        user_member.status = { "id" => id, "turns" => turns }
        return "#{user_member.species.name} gained #{id}!"
      else
        target_hash["status"] = { "id" => id, "turns" => turns } # wild self — misuse; wild is user when foe
      end
    end
    if user_is_ally
      target_hash["status"] = { "id" => id, "turns" => turns } unless self_buff
      return "Foe afflicted with #{id}!" unless self_buff
      return "#{user_member.species.name} gained #{id}!"
    else
      # foe used move on ally
      unless self_buff
        user_member.status = { "id" => id, "turns" => turns }
        return "#{user_member.species.name} afflicted with #{id}!"
      else
        target_hash["status"] = { "id" => id, "turns" => turns }
        return "Wild #{target_hash["species"].name} gained #{id}!"
      end
    end
  end

  def player_attack(move)
    @busy = true
    acc = move["accuracy"] || 1.0
    acc *= 0.75 if @ally.status && @ally.status["id"] == "pollen"
    if rand > acc
      @log = "#{@ally.species.name}'s #{move["name"]} missed!"
      Routewild::AudioHub.se("Miss")
      refresh_ui
      foe_turn
      return
    end
    dmg, mult = Routewild::GameMath.damage(
      @ally.atk, Routewild::GameMath.stat(@wild["species"].base["def"], @wild["level"]),
      move, move["type"], @wild["species"].type,
      status_atk_mod(@ally), status_def_mod(@wild)
    )
    @wild["hp"] = [@wild["hp"] - dmg, 0].max if move["power"] > 0
    Routewild::AudioHub.se("Hit")
    @log = "#{@ally.species.name} used #{move["name"]}! (#{dmg})"
    @log += " Strong!" if mult > 1
    @log += " Weak…" if mult < 1 && move["power"] > 0
    eff = try_effect(move, @ally, @wild, true)
    @log += " " + eff if eff
    refresh_ui
    if @wild["hp"] <= 0
      win
    else
      foe_turn
    end
  end

  def foe_turn
    move = @wild["species"].moves[rand(@wild["species"].moves.size)]
    dmg, = Routewild::GameMath.damage(
      Routewild::GameMath.stat(@wild["species"].base["atk"], @wild["level"]),
      @ally.defense, move, move["type"], @ally.species.type,
      status_atk_mod(@wild), status_def_mod(@ally)
    )
    @ally.hp = [@ally.hp - dmg, 0].max if move["power"] > 0
    Routewild::AudioHub.se("Hit")
    @log = "Wild #{@wild["species"].name} used #{move["name"]}! (#{dmg})"
    eff = try_effect(move, @ally, @wild, false)
    @log += " " + eff if eff
    refresh_ui
    if @ally.hp <= 0
      @log = "Your party is weary… Returning to Petalvale."
      refresh_ui
      @ally.hp = [1, (@ally.max_hp * 0.4).to_i].max
      @state.map_id = "town"
      @state.player_x = 10
      @state.player_y = 12
      $scene = Scene_RoutewildMap.new
    else
      @busy = false
      @phase = :menu
      refresh_ui
    end
  end

  def win
    xp = 8 + @wild["level"] * 3
    money = 6 + @wild["level"] * 2
    @state.money += money
    @state.battles_won += 1
    @ally.xp += xp
    while @ally.xp >= Routewild::GameMath.xp_to_next(@ally.level) && @ally.level < Routewild::Config::MAX_LEVEL
      @ally.xp -= Routewild::GameMath.xp_to_next(@ally.level)
      @ally.level += 1
      @ally.skill_points += 1
      @ally.refresh_stats
      @ally.hp = @ally.max_hp
    end
    Routewild::AudioHub.se("Win")
    @log = "Won! +#{xp} XP, +#{money}❀"
    refresh_ui
    $scene = Scene_RoutewildMap.new
  end

  def try_catch
    if (@state.inventory["orb"] || 0) <= 0
      @log = "No Catch Orbs!"
      refresh_ui
      return
    end
    @state.inventory["orb"] -= 1
    chance = Routewild::GameMath.catch_chance(@wild["species"], @wild["hp"].to_f / @wild["max_hp"])
    if rand < chance
      Routewild::AudioHub.se("Catch")
      @state.dex[@wild["species"].id] = true
      member = Routewild::PartyMember.new(@wild["species"].id, @wild["level"])
      if @state.party.size < Routewild::Config::PARTY_MAX
        @state.party << member
        @log = "Gotcha! #{@wild["species"].name} joined the party!"
      elsif @state.storage.size < Routewild::Config::PEN_MAX
        @state.storage << member
        @log = "Gotcha! Sent to the Creature Pen!"
      else
        @log = "Gotcha! Recorded in Dex (party & pen full)."
      end
      refresh_ui
      $scene = Scene_RoutewildMap.new
    else
      Routewild::AudioHub.se("Miss")
      @log = "Oh no! Broke free!"
      refresh_ui
      foe_turn
    end
  end

  def update
    return if @busy && @phase == :menu
    if @phase == :menu
      if Input.trigger?(Input::C)
        @phase = :moves
        @move_index = 0
        refresh_ui
      elsif Input.trigger?(Input::A)
        try_catch
      elsif Input.trigger?(Input::L) || Input.trigger?(Input::R)
        if (@state.inventory["potion"] || 0) > 0
          @state.inventory["potion"] -= 1
          heal = [@ally.max_hp - @ally.hp, 28].min
          @ally.hp += heal
          Routewild::AudioHub.se("Heal")
          @log = "Used Petal Tonic! (+#{heal})"
          refresh_ui
          foe_turn
        else
          @log = "No Petal Tonics!"
          refresh_ui
        end
      elsif Input.trigger?(Input::B)
        if rand < 0.7
          @log = "Got away safely."
          $scene = Scene_RoutewildMap.new
        else
          @log = "Couldn't escape!"
          refresh_ui
          foe_turn
        end
      end
    else
      moves = @ally.species.moves
      if Input.trigger?(Input::RIGHT) || Input.trigger?(Input::DOWN)
        @move_index = (@move_index + 1) % moves.size
        refresh_ui
      elsif Input.trigger?(Input::LEFT) || Input.trigger?(Input::UP)
        @move_index = (@move_index - 1) % moves.size
        refresh_ui
      elsif Input.trigger?(Input::B)
        @phase = :menu
        refresh_ui
      elsif Input.trigger?(Input::C)
        player_attack(moves[@move_index])
      end
    end
  end

  def dispose
    Graphics.freeze
    @sprites.each do |s|
      s.bitmap.dispose if s.bitmap && !s.bitmap.disposed?
      s.dispose
    end
  end
end
