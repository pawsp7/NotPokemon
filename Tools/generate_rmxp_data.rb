#!/usr/bin/env ruby
# Convenience wrapper — packs Scripts into Data/Scripts.rxdata
# For other Data/*.rxdata files, copy them from a blank RPG Maker XP project
# (see README.md). Routewild gameplay is driven by Scripts/ + PBS/, not DB maps.

load File.expand_path("pack_scripts.rb", __dir__)
