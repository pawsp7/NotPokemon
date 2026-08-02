#==============================================================================
# Main entry — RPG Maker XP style scene loop
# Replace the default Main script with this (or place last in Script Editor).
#==============================================================================

begin
  # Boot Routewild custom scenes (keeps RTP optional for our assets)
  $scene = Scene_RoutewildTitle.new
  while $scene != nil
    $scene.main
  end
  Graphics.transition(20)
rescue Errno::ENOENT
  filename = $!.message.sub("No such file or directory - ", "")
  print("Unable to find file #{filename}.")
rescue
  print("Script error:\n#{$!.class}\n#{$!.message}\n\n" + $!.backtrace.join("\n"))
end
