#!/usr/bin/env ruby
# Pack Scripts/*.rb into Data/Scripts.rxdata for RPG Maker XP / MKXP.
# Run from the project root:  ruby Tools/pack_scripts.rb
#
# Note: Official RPG Maker XP uses Ruby 1.8 Marshal. If the editor cannot
# read Scripts.rxdata, import the .rb files manually (see README.md).
# MKXP / MKXP-Z generally accept this pack.

require "zlib"
require "fileutils"

root = File.expand_path("..", __dir__)
scripts_dir = File.join(root, "Scripts")
out_path = File.join(root, "Data", "Scripts.rxdata")
FileUtils.mkdir_p(File.dirname(out_path))

files = Dir[File.join(scripts_dir, "*.rb")].sort
raise "No Scripts/*.rb found" if files.empty?

packed = []
files.each_with_index do |path, i|
  name = File.basename(path, ".rb")
  # Strip numeric prefix for display name in Script Editor
  display = name.sub(/^\d+_/, "")
  body = File.binread(path)
  # RMXP expects UTF-8 or ASCII; keep as-is
  packed << [(i + 1) * 1000, display, Zlib::Deflate.deflate(body)]
  puts "  + #{display}"
end

File.open(out_path, "wb") { |f| Marshal.dump(packed, f) }
puts "Wrote #{out_path} (#{packed.size} scripts)"
