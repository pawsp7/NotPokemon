#==============================================================================
# Audio helpers — uses Audio/BGM and Audio/SE exported from the web game
#==============================================================================
module Routewild
  module AudioHub
    module_function

    MAP_BGM = {
      "town" => "Town", "route" => "Route", "grove" => "Grove",
      "shore" => "Shore", "pen" => "Pen", "battle" => "Battle", "title" => "Title"
    }

    def play_bgm(key, volume = 70, pitch = 100)
      name = MAP_BGM[key] || key
      begin
        Audio.bgm_play("Audio/BGM/#{name}", volume, pitch)
      rescue
        # Missing file / RTP-less environments fail soft
      end
    end

    def stop_bgm
      begin; Audio.bgm_stop; rescue; end
    end

    def se(name, volume = 80, pitch = 100)
      begin
        Audio.se_play("Audio/SE/#{name}", volume, pitch)
      rescue
      end
    end
  end
end
