#==============================================================================
# Plain-text PBS loaders — edit PBS/*.txt then reload (F12 / restart playtest)
#==============================================================================
module Routewild
  module PBS
    module_function

    def read_lines(filename)
      path = Config::PBS_PATH + filename
      return [] unless File.exist?(path)
      File.readlines(path).map { |l| l.strip }.reject { |l| l.empty? || l[0,1] == "#" }
    end

    def load_creatures
      list = []
      cur = nil
      read_lines("creatures.txt").each do |line|
        if line =~ /^\[(\d+)\]/
          list << cur if cur
          cur = { "id_num" => $1.to_i }
        elsif cur && line.include?("=")
          k, v = line.split("=", 2).map { |s| s.strip }
          cur[k] = v
        end
      end
      list << cur if cur
      list.each do |c|
        c["internal"] = (c["InternalName"] || "").downcase
        c["name"] = c["Name"]
        c["type"] = c["Type"]
        c["area"] = c["Area"]
        c["catch"] = (c["CatchRate"] || "0.5").to_f
        c["weight"] = (c["Weight"] || "10").to_i
        stats = (c["BaseStats"] || "40,40,40,40").split(",").map { |n| n.to_i }
        c["base"] = { "hp" => stats[0], "atk" => stats[1], "def" => stats[2], "spd" => stats[3] }
        c["desc"] = c["Description"] || ""
        c["battler"] = c["Battler"] || c["internal"]
        c["moves"] = parse_moves(c["Moves"] || "")
      end
      list
    end

    def parse_moves(str)
      str.split("|").map do |chunk|
        parts = chunk.strip.split(",")
        eff = nil
        if parts[4] && parts[4] != "NONE"
          eid, ch, turns = parts[4].split(":")
          eff = { "id" => eid.downcase, "chance" => ch.to_f, "turns" => turns.to_i }
        end
        {
          "name" => (parts[0] || "Move").gsub("_", " "),
          "power" => (parts[1] || "10").to_i,
          "type" => parts[2] || "Fairy",
          "accuracy" => (parts[3] || "1").to_f,
          "effect" => eff,
          "desc" => parts[5] || ""
        }
      end
    end

    def load_grid(map_id)
      path = Config::PBS_PATH + "map_#{map_id}.txt"
      return Array.new(Config::MAP_H) { Array.new(Config::MAP_W, 3) } unless File.exist?(path)
      File.readlines(path).map { |l| l.strip.split(",").map { |n| n.to_i } }
    end

    def load_world
      path = Config::PBS_PATH + "world.json"
      if File.exist?(path)
        # Minimal JSON-ish parse is avoided; use maps.txt + grids
      end
      load_maps_txt
    end

    def load_maps_txt
      maps = {}
      cur = nil
      id = nil
      read_lines("maps.txt").each do |line|
        if line =~ /^\[(\w+)\]/
          maps[id] = cur if cur && id
          id = $1
          cur = { "id" => id, "warps" => [], "npcs" => [], "pens" => [] }
        elsif cur && line.include?("=")
          k, v = line.split("=", 2).map { |s| s.strip }
          v = v.sub(/\\$/, "")
          case k
          when "Name" then cur["name"] = v
          when "Panorama" then cur["bg"] = v
          when "Encounter" then cur["encounter"] = (v == "true")
          when "StartX" then cur["start_x"] = v.to_i
          when "StartY" then cur["start_y"] = v.to_i
          when "BGM" then cur["bgm"] = v
          when /^Warp\d+/
            x,y,to,tx,ty,dir = v.split(",")
            cur["warps"] << { "x"=>x.to_i,"y"=>y.to_i,"to"=>to,"tx"=>tx.to_i,"ty"=>ty.to_i,"dir"=>dir }
          when /^NPC\d+/
            bits = v.split(",", 7)
            cur["npcs"] << {
              "id"=>bits[0], "x"=>bits[1].to_i, "y"=>bits[2].to_i,
              "name"=>bits[3], "kind"=>bits[4], "sprite"=>bits[5],
              "lines"=>(bits[6] || "").split("|").map { |s| s.strip }
            }
          when "Pens"
            cur["pens"] = v.split(";").map { |p| a=p.split(","); { "x"=>a[0].to_i, "y"=>a[1].to_i } }
          end
        end
      end
      maps[id] = cur if cur && id
      maps.each_key { |mid| maps[mid]["grid"] = load_grid(mid) }
      maps
    end

    def load_type_chart
      chart = {}
      read_lines("types.txt").each do |line|
        a, b, m = line.split(",")
        chart[a] ||= {}
        chart[a][b] = m.to_f
      end
      chart
    end

    def load_kv_list(filename, fields)
      # generic comma rows after header comments already stripped
      read_lines(filename).map { |l| Hash[*fields.zip(l.split(",")).flatten] }
    end
  end
end
