#==============================================================================
# Routewild — Configuration (RPG Maker XP / RGSS)
# Edit these constants to tune the game without touching core logic.
#==============================================================================
module Routewild
  module Config
    TITLE           = "Routewild"
    TILE_SIZE       = 32
    MAP_W           = 20
    MAP_H           = 15
    SCREEN_W        = 640
    SCREEN_H        = 480
    MOVE_FRAMES     = 8
    PARTY_MAX       = 3
    PEN_MAX         = 8
    TOTAL_CREATURES = 15
    START_MONEY     = 80
    START_ORBS      = 15
    START_POTIONS   = 3
    ENCOUNTER_RATE  = 22   # percent in tall grass
    MAX_LEVEL       = 20
    STARTERS        = ["bloomvu", "fernkit", "lilypurr"]
    PBS_PATH        = "PBS/"
    SOLID_TILES     = [3, 4, 6, 8, 9, 10] # tree water rock fence building ledge
    TALL_GRASS      = 2
    PATH_TILE       = 1
  end
end
