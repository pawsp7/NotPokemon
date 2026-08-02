#==============================================================================
# Overworld map — panorama + collision grid from PBS (keeps web map mechanics)
#==============================================================================
class Scene_RoutewildMap
  def main
    @state = $routewild
    Routewild::Data.load_all if Routewild::Data.maps.empty?
    @map = Routewild::Data.maps[@state.map_id]
    @sprites = []
    @moving = false
    @move_t = 0
    @from_x = @to_x = @state.player_x
    @from_y = @to_y = @state.player_y
    create
    play_map_bgm
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
    @bg = Sprite.new(@viewport)
    load_panorama
    @sprites << @bg

    @player = Sprite.new(@viewport)
    load_player_bitmap
    place_player_sprite
    @sprites << @player

    @npc_sprites = []
    (@map["npcs"] || []).each do |npc|
      sp = Sprite.new(@viewport)
      begin
        sp.bitmap = Bitmap.new("Graphics/Characters/$#{npc["sprite"]}")
        # show down-idle frame
        sp.src_rect = Rect.new(0, 0, 48, 48)
      rescue
        sp.bitmap = Bitmap.new(32, 32)
        sp.bitmap.fill_rect(0, 0, 32, 32, Color.new(232, 145, 176))
      end
      sp.x = npc["x"] * 32 + 8
      sp.y = npc["y"] * 32
      @npc_sprites << sp
      @sprites << sp
    end

    @hud = Sprite.new(@viewport)
    @hud.z = 100
    refresh_hud
    @sprites << @hud

    @msg = Sprite.new(@viewport)
    @msg.z = 110
    mb = Bitmap.new(640, 28)
    mb.fill_rect(0, 0, 640, 28, Color.new(255, 248, 251, 200))
    mb.font.size = 14
    mb.font.color = Color.new(74, 42, 50)
    mb.draw_text(8, 2, 624, 24, "Arrows move · Z/Space talk · Shift party · A travel · X outfit")
    @msg.bitmap = mb
    @msg.y = 452
    @sprites << @msg
  end

  def load_panorama
    begin
      @bg.bitmap.dispose if @bg.bitmap
      @bg.bitmap = Bitmap.new("Graphics/Panoramas/#{@map["bg"]}")
    rescue
      @bg.bitmap = Bitmap.new(640, 480)
      @bg.bitmap.fill_rect(0, 0, 640, 480, Color.new(232, 180, 200))
    end
  end

  def load_player_bitmap
    outfit = @state.outfit || "cloak_pink"
    begin
      @player.bitmap.dispose if @player.bitmap && !@player.bitmap.disposed?
      @player.bitmap = Bitmap.new("Graphics/Characters/$Player_#{outfit}")
    rescue
      begin
        @player.bitmap = Bitmap.new("Graphics/Characters/$Player")
      rescue
        @player.bitmap = Bitmap.new(48, 48)
        @player.bitmap.fill_rect(8, 8, 32, 32, Color.new(196, 95, 132))
      end
    end
    set_player_frame(0)
  end

  def set_player_frame(frame)
    dir_row = { 2 => 0, 4 => 1, 6 => 2, 8 => 3 }[@state.facing] || 0
    fw = @player.bitmap.width / 4
    fh = @player.bitmap.height / 4
    @player.src_rect = Rect.new(frame * fw, dir_row * fh, fw, fh)
  end

  def place_player_sprite
    @player.x = @state.player_x * 32 + (32 - @player.src_rect.width) / 2
    @player.y = @state.player_y * 32 + 32 - @player.src_rect.height
    @player.z = 50
  end

  def refresh_hud
    bmp = Bitmap.new(640, 36)
    bmp.fill_rect(0, 0, 640, 36, Color.new(255, 248, 251, 210))
    bmp.font.size = 16
    bmp.font.color = Color.new(74, 42, 50)
    name = @map["name"] || @state.map_id
    bmp.draw_text(8, 6, 200, 24, name)
    bmp.draw_text(220, 6, 200, 24, "❀ #{@state.money}   Orbs #{@state.inventory["orb"]}")
    bmp.draw_text(450, 6, 180, 24, "Dex #{@state.dex.size}/15", 2)
    @hud.bitmap.dispose if @hud.bitmap
    @hud.bitmap = bmp
  end

  def play_map_bgm
    Routewild::AudioHub.play_bgm(@map["bgm"] || @state.map_id)
  end

  def solid?(x, y)
    return true if x < 0 || y < 0 || x >= 20 || y >= 15
    tile = @map["grid"][y][x]
    return true if Routewild::Config::SOLID_TILES.include?(tile)
    (@map["npcs"] || []).any? { |n| n["x"] == x && n["y"] == y }
  end

  def warp_at(x, y)
    (@map["warps"] || []).find { |w| w["x"] == x && w["y"] == y }
  end

  def try_move(dx, dy)
    return if @moving
    nx = @state.player_x + dx
    ny = @state.player_y + dy
    @state.facing = 6 if dx > 0
    @state.facing = 4 if dx < 0
    @state.facing = 2 if dy > 0
    @state.facing = 8 if dy < 0
    set_player_frame(0)
    w = warp_at(nx, ny)
    if !w && solid?(nx, ny)
      Routewild::AudioHub.se("Miss")
      return
    end
    @from_x = @state.player_x
    @from_y = @state.player_y
    @to_x = nx
    @to_y = ny
    @moving = true
    @move_t = 0
    Routewild::AudioHub.se("Walk")
  end

  def finish_step
    @state.player_x = @to_x
    @state.player_y = @to_y
    @moving = false
    place_player_sprite
    w = warp_at(@state.player_x, @state.player_y)
    if w
      enter_map(w["to"], w["tx"], w["ty"])
      return
    end
    if @map["encounter"] && @map["grid"][@state.player_y][@state.player_x] == Routewild::Config::TALL_GRASS
      if rand(100) < Routewild::Config::ENCOUNTER_RATE
        $scene = Scene_RoutewildBattle.new
      end
    end
  end

  def enter_map(map_id, x, y)
    Routewild::AudioHub.se("Warp")
    @state.map_id = map_id
    @state.player_x = x
    @state.player_y = y
    @map = Routewild::Data.maps[map_id]
    load_panorama
    # rebuild NPC sprites
    @npc_sprites.each { |s| s.bitmap.dispose if s.bitmap; s.dispose; @sprites.delete(s) }
    @npc_sprites.clear
    (@map["npcs"] || []).each do |npc|
      sp = Sprite.new(@viewport)
      begin
        sp.bitmap = Bitmap.new("Graphics/Characters/$#{npc["sprite"]}")
        sp.src_rect = Rect.new(0, 0, 48, 48)
      rescue
        sp.bitmap = Bitmap.new(32, 32)
        sp.bitmap.fill_rect(0, 0, 32, 32, Color.new(232, 145, 176))
      end
      sp.x = npc["x"] * 32 + 8
      sp.y = npc["y"] * 32
      @npc_sprites << sp
      @sprites << sp
    end
    place_player_sprite
    refresh_hud
    play_map_bgm
  end

  def facing_tile
    x = @state.player_x
    y = @state.player_y
    case @state.facing
    when 8 then y -= 1
    when 2 then y += 1
    when 4 then x -= 1
    when 6 then x += 1
    end
    [x, y]
  end

  def interact
    fx, fy = facing_tile
    npc = (@map["npcs"] || []).find { |n| n["x"] == fx && n["y"] == fy }
    return unless npc
    Routewild::AudioHub.se("UI")
    case npc["kind"]
    when "heal"
      @state.party.each { |m| m.hp = m.max_hp; m.status = nil }
      Routewild::AudioHub.se("Heal")
      show_temp_msg("Your party was fully healed.")
    when "shop"
      @state.inventory["orb"] += 1 if @state.money >= 12 && ( @state.money -= 12; true)
      show_temp_msg("Bought supplies (orbs/tonics available in full shop UI).")
    when "pen"
      show_temp_msg("Creature Pen — deposit/withdraw via A menu in full build.")
    else
      show_temp_msg(npc["lines"][0] || "...")
    end
  end

  def show_temp_msg(text)
    @msg.bitmap.dispose if @msg.bitmap
    mb = Bitmap.new(640, 28)
    mb.fill_rect(0, 0, 640, 28, Color.new(255, 248, 251, 220))
    mb.font.size = 14
    mb.font.color = Color.new(74, 42, 50)
    mb.draw_text(8, 2, 624, 24, text)
    @msg.bitmap = mb
  end

  def open_travel
    # Cycle travel points with confirm — simple RMXP-friendly teleport
    points = [
      ["town", 10, 12], ["route", 10, 3], ["grove", 2, 7],
      ["shore", 10, 2], ["pen", 4, 12]
    ]
    @travel_i = ((@travel_i || 0) + 1) % points.size
    id, x, y = points[@travel_i]
    enter_map(id, x, y)
    show_temp_msg("Traveled to #{@map["name"]}. (L/R cycles destinations)")
  end

  def update
    if @moving
      @move_t += 1
      t = @move_t.to_f / Routewild::Config::MOVE_FRAMES
      t = 1 if t > 1
      ease = t * t * (3 - 2 * t)
      px = (@from_x + (@to_x - @from_x) * ease) * 32
      py = (@from_y + (@to_y - @from_y) * ease) * 32
      @player.x = px + (32 - @player.src_rect.width) / 2
      @player.y = py + 32 - @player.src_rect.height
      set_player_frame((@move_t / 2) % 4)
      finish_step if @move_t >= Routewild::Config::MOVE_FRAMES
      return
    end

    if Input.press?(Input::UP)
      try_move(0, -1)
    elsif Input.press?(Input::DOWN)
      try_move(0, 1)
    elsif Input.press?(Input::LEFT)
      try_move(-1, 0)
    elsif Input.press?(Input::RIGHT)
      try_move(1, 0)
    end

    interact if Input.trigger?(Input::C)
    # Shift (Input::A) = party summary; letter A often mapped to Input::X in F1
    if Input.trigger?(Input::A)
      lead = @state.lead
      if lead
        show_temp_msg("#{lead.species.name} Lv#{lead.level} HP #{lead.hp}/#{lead.max_hp} — Skills #{lead.skill_points}")
      end
    end
    open_travel if Input.trigger?(Input::L) || Input.trigger?(Input::R)
    if Input.trigger?(Input::X) || Input.trigger?(Input::Y)
      outfits = ["cloak_pink", "coat_mint", "cape_lavender", "vest_coral"]
      unlocked = @state.cosmetics["outfits"]
      cur = outfits.index(@state.outfit) || 0
      4.times do
        cur = (cur + 1) % outfits.size
        break if unlocked.include?(outfits[cur])
      end
      @state.outfit = outfits[cur]
      load_player_bitmap
      place_player_sprite
      show_temp_msg("Outfit: #{@state.outfit}")
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
