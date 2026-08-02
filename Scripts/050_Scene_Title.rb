#==============================================================================
# Title / starter select — RPG Maker XP scene style
#==============================================================================
class Scene_RoutewildTitle
  def main
    Routewild::Data.load_all
    @state = Routewild::GameState.new
    $routewild = @state
    @starter = nil
    @index = 0
    @sprites = []
    create_background
    create_ui
    Routewild::AudioHub.play_bgm("title")
    Graphics.transition
    loop do
      Graphics.update
      Input.update
      update
      break if $scene != self
    end
    dispose
  end

  def create_background
    @viewport = Viewport.new(0, 0, 640, 480)
    @bg = Sprite.new(@viewport)
    begin
      @bg.bitmap = Bitmap.new("Graphics/Panoramas/town")
    rescue
      @bg.bitmap = Bitmap.new(640, 480)
      @bg.bitmap.fill_rect(0, 0, 640, 480, Color.new(247, 196, 212))
    end
    @sprites << @bg
  end

  def create_ui
    @panel = Sprite.new(@viewport)
    bmp = Bitmap.new(420, 280)
    bmp.fill_rect(0, 0, 420, 280, Color.new(255, 248, 251))
    bmp.font.name = "Arial"
    bmp.font.size = 22
    bmp.font.color = Color.new(196, 95, 132)
    bmp.draw_text(0, 12, 420, 28, "Routewild", 1)
    bmp.font.size = 16
    bmp.font.color = Color.new(74, 42, 50)
    bmp.draw_text(20, 48, 380, 40, "Choose a starter. Mechanics match the web build.", 1)
    @panel.bitmap = bmp
    @panel.x = 110
    @panel.y = 90
    @sprites << @panel

    @starter_ids = Routewild::Config::STARTERS
    @cards = []
    @starter_ids.each_with_index do |id, i|
      sp = Sprite.new(@viewport)
      begin
        sp.bitmap = Bitmap.new("Graphics/Battlers/#{id}")
      rescue
        sp.bitmap = Bitmap.new(96, 96)
        sp.bitmap.fill_rect(0, 0, 96, 96, Color.new(232, 145, 176))
      end
      sp.zoom_x = sp.zoom_y = 0.7
      sp.x = 150 + i * 120
      sp.y = 200
      @cards << sp
      @sprites << sp
    end
    @hint = Sprite.new(@viewport)
    hb = Bitmap.new(640, 32)
    hb.font.size = 14
    hb.font.color = Color.new(74, 42, 50)
    hb.draw_text(0, 0, 640, 32, "← → select · Z/C/Space confirm · Esc quit", 1)
    @hint.bitmap = hb
    @hint.y = 420
    @sprites << @hint
    refresh_selection
  end

  def refresh_selection
    @cards.each_with_index do |sp, i|
      sp.y = (i == @index) ? 188 : 200
      sp.opacity = (i == @index) ? 255 : 180
    end
    @starter = @starter_ids[@index]
  end

  def update
    if Input.trigger?(Input::RIGHT)
      @index = (@index + 1) % @starter_ids.size
      Routewild::AudioHub.se("UI")
      refresh_selection
    elsif Input.trigger?(Input::LEFT)
      @index = (@index - 1) % @starter_ids.size
      Routewild::AudioHub.se("UI")
      refresh_selection
    elsif Input.trigger?(Input::C) # Z / Space / Enter by default
      confirm
    elsif Input.trigger?(Input::B)
      $scene = nil
    end
  end

  def confirm
    return unless @starter
    Routewild::AudioHub.se("Catch")
    $routewild.start_with!(@starter)
    $scene = Scene_RoutewildMap.new
  end

  def dispose
    Graphics.freeze
    @sprites.each { |s| s.bitmap.dispose if s.bitmap; s.dispose }
  end
end
