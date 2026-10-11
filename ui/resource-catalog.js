// Resource modifiers verified against the installed 1.5 game data, 2026-09-27.
export const RESOURCE_EFFECTS = [
  {
    "requirements": [],
    "id": "MOD_CLAY_WAREHOUSE_PRODUCTION",
    "args": {
      "Amount": "1",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_CLAY"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COTTON_CITY_FLAT_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_COTTON"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COTTON_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_COTTON"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_COWRIE_CITY_FLAT_GOLD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_COWRIE_TOWN_FLAT_SCIENCE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_CRABS_WAREHOUSE_FOOD",
    "args": {
      "Amount": "1",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_CRABS"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DATES_CITY_FLAT_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_DATES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DATES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_DATES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DYES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_DYES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FISH_CITY_FLAT_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_FISH"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FLAX_CITY_FLAT_CULTURE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_FLAX"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FLAX_CITY_FLAT_SCIENCE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_FLAX"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_HAPPINESS",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GYPSUM_CAPITAL_PRODUCTION",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_GYPSUM"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_CAPITAL"
      }
    ],
    "id": "MOD_GYPSUM_CITY_PRODUCTION",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_GYPSUM"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_HARDWOOD_NAVAL_PRODUCTION",
    "args": {
      "Percent": "10",
      "Domain": "DOMAIN_SEA",
      "ResourceType": "RESOURCE_HARDWOOD"
    },
    "effect": "EFFECT_PLAYER_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_HIDES_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_HIDES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_CAVALRY"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_HORSES_CAVALRY_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_HORSES"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_INCENSE_CITY_SCIENCE",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_INCENSE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_INFANTRY"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_IRON_INFANTRY_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_IRON"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_DESERT_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_DESERT",
      "Amount": "10",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_PLAINS_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_PLAINS",
      "Amount": "10",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_TROPICAL_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TROPICAL",
      "Amount": "10",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_JADE_GOLD",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_JADE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_KAOLIN_CAPITAL_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_KAOLIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_CAPITAL"
      }
    ],
    "id": "MOD_KAOLIN_CITY_FOOD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_KAOLIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_LAPIS_LAZULI_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_LAPIS_LAZULI"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_LAPIS_LAZULI_CITY_GOLD",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_LAPIS_LAZULI"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_DESERT_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_DESERT",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_GRASSLAND_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_GRASSLAND",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_MARINE_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_MARINE",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_PLAINS_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_PLAINS",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_TROPICAL_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TROPICAL",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LIMESTONE_TUNDRA_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TUNDRA",
      "Amount": "5",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MANGOS_CITY_FLAT_CULTURE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_MANGOS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MANGOS_CITY_FLAT_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_MANGOS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_GRASSLAND_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_GRASSLAND",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_MARINE_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_MARINE",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_TUNDRA_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TUNDRA",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_PEARLS_CAPITAL_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_CAPITAL"
      }
    ],
    "id": "MOD_PEARLS_CITY_HAPPINESS",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_RICE_CITY_FLAT_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "2",
      "ResourceType": "RESOURCE_RICE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_RUBIES_CITY_FLAT_GOLD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_RUBIES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_SALT_UNIT_PRODUCTION",
    "args": {
      "ResourceType": "RESOURCE_SALT",
      "Percent": "20"
    },
    "effect": "EFFECT_CITY_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_SILK_CITY_CULTURE",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_SILK"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_FOOD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_DISTANT_LANDS_UNIT_PURCHASE_DISCOUNT",
    "args": {
      "Percent": "20",
      "AffectUnits": "true",
      "ResourceType": "RESOURCE_SILVER_DISTANT_LANDS"
    },
    "effect": "EFFECT_PLAYER_ADJUST_PURCHASE_EFFICIENCY_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_TIN_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_TIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_TIN_TOWN_FLAT_PRODUCTION",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_TIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_TURTLES_WAREHOUSE_CULTURE",
    "args": {
      "Amount": "1",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_TURTLES"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_WILD_GAME_CITY_FLAT_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_WILD_GAME"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_WILD_GAME_TOWN_FLAT_FOOD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_WILD_GAME"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WINE_FLAT_HAPPINESS",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE"
      }
    ],
    "id": "MOD_WINE_GOLDEN_AGE_CULTURE",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_WOOL_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_WOOL"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WOOL_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_WOOL"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "antiquity",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_CLAY_WAREHOUSE_PRODUCTION",
    "args": {
      "Amount": "1",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_CLAY"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_CLOVES_CITY_FLAT_FOOD",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_CLOVES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_CLOVES_CITY_GOLD",
    "args": {
      "YieldType": "YIELD_GOLD",
      "PercentMultiplier": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_CLOVES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_COCOA_DISTANT_LAND_TOWN_HAPPINESS",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_COCOA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_COCOA_HOMELAND_TOWN_HAPPINESS",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_COCOA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COTTON_CITY_FLAT_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_COTTON"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COTTON_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_COTTON"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_COWRIE_CITY_FLAT_GOLD",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_COWRIE_TOWN_FLAT_SCIENCE",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_CRABS_WAREHOUSE_FOOD",
    "args": {
      "Amount": "2",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_CRABS"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DATES_CITY_FLAT_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_DATES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DATES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_DATES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_DYES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_DYES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FISH_CITY_FLAT_FOOD",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_FISH"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FLAX_CITY_FLAT_CULTURE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_FLAX"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FLAX_CITY_FLAT_SCIENCE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_FLAX"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_FURS_FLAT_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_FURS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE"
      }
    ],
    "id": "MOD_FURS_GOLDEN_AGE_GOLD",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_FURS"
    },
    "effect": "EFFECT_PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_HAPPINESS",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_GYPSUM_DISTANT_LAND_PRODUCTION",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_GYPSUM"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_GYPSUM_HOMELAND_PRODUCTION",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_GYPSUM"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_HARDWOOD_NAVAL_PRODUCTION",
    "args": {
      "Percent": "20",
      "Domain": "DOMAIN_SEA",
      "ResourceType": "RESOURCE_HARDWOOD"
    },
    "effect": "EFFECT_PLAYER_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_CAVALRY"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_HORSES_CAVALRY_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_HORSES"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_INCENSE_CITY_MISSIONARY_PRODUCTION",
    "args": {
      "UnitTag": "UNIT_CLASS_RELIGIOUS",
      "Percent": "100",
      "ResourceType": "RESOURCE_INCENSE"
    },
    "effect": "EFFECT_CITY_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_INCENSE_CITY_TEMPLE_PRODUCTION",
    "args": {
      "ConstructibleType": "BUILDING_TEMPLE",
      "Amount": "100",
      "ResourceType": "RESOURCE_INCENSE"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_INFANTRY"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_IRON_INFANTRY_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_IRON"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_JADE_CITY_GOLD",
    "args": {
      "YieldType": "YIELD_GOLD",
      "PercentMultiplier": "true",
      "Amount": "15",
      "ResourceType": "RESOURCE_JADE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_KAOLIN_DISTANT_LAND_FOOD",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_KAOLIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_KAOLIN_HOMELAND_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_KAOLIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_LIMESTONE_BUILDING_PRODUCTION",
    "args": {
      "Empire": "true",
      "ConstructibleClass": "BUILDING",
      "Amount": "10",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_FLAT_HAPPINESS",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_FLAT_PRODUCTION",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MANGOS_CITY_FLAT_CULTURE",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_MANGOS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MANGOS_CITY_FLAT_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_MANGOS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_DESERT_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_DESERT",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_GRASSLAND_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_GRASSLAND",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_MARINE_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_MARINE",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_PLAINS_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_PLAINS",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_TROPICAL_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TROPICAL",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_TUNDRA_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TUNDRA",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_NAVAL, UNIT_CLASS_SIEGE"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_NITER_SIEGE_AND_NAVAL_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_NITER"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_PEARLS_DISTANT_LAND_HAPPINESS",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_PEARLS_HOMELAND_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_PITCH_WATER_BUILDINGS_GOLD",
    "args": {
      "Amount": "1",
      "Tag": "WATER",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_PITCH"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_RICE_CITY_FLAT_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "2",
      "ResourceType": "RESOURCE_RICE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_RUBIES_DISTANT_LAND_TOWN_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_RUBIES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_RUBIES_HOMELAND_TOWN_GOLD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_RUBIES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_SILK_CITY_CULTURE",
    "args": {
      "YieldType": "YIELD_CULTURE",
      "PercentMultiplier": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_SILK"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_FOOD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SPICES_DISTANT_LANDS_CULTURE",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SPICES_DISTANT_LANDS_INFLUENCE",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_DIPLOMACY",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SPICES_HOMELAND_CULTURE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SPICES_HOMELAND_INFLUENCE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_DIPLOMACY",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SUGAR_DISTANT_LANDS_FOOD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SUGAR"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SUGAR_DISTANT_LANDS_HAPPINESS",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_SUGAR"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SUGAR_HOMELAND_FOOD",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SUGAR"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_SUGAR_HOMELAND_HAPPINESS",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_SUGAR"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_TEA_DISTANT_LANDS_PRODUCTION",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_TEA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_TEA_DISTANT_LANDS_SCIENCE",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_TEA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_TEA_HOMELAND_PRODUCTION",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_TEA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      },
      {
        "args": {},
        "inverse": true,
        "type": "REQUIREMENT_CITY_IS_DISTANT_LANDS"
      }
    ],
    "id": "MOD_TEA_HOMELAND_SCIENCE",
    "args": {
      "Amount": "2",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_TEA"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_TIN_FLAT_GOLD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_TIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_TIN_FLAT_PRODUCTION",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_TIN"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_TRUFFLES_UNIT_PRODUCTION",
    "args": {
      "ResourceType": "RESOURCE_TRUFFLES",
      "Percent": "20"
    },
    "effect": "EFFECT_CITY_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_TURTLES_WAREHOUSE_CULTURE",
    "args": {
      "Amount": "2",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_TURTLES"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WHALES_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "5",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_WHALES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_WILD_GAME_CITY_FLAT_FOOD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_WILD_GAME"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_WILD_GAME_TOWN_FLAT_FOOD",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_WILD_GAME"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WINE_FLAT_HAPPINESS",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_CAPITAL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE"
      }
    ],
    "id": "MOD_WINE_GOLDEN_AGE_CULTURE",
    "args": {
      "Amount": "10",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE",
    "era": "exploration",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_CITRUS_NAVAL_PRODUCTION",
    "args": {
      "Percent": "5",
      "Domain": "DOMAIN_SEA",
      "ResourceType": "RESOURCE_CITRUS"
    },
    "effect": "EFFECT_CITY_ADJUST_UNIT_PRODUCTION_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_LIGHT"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_COAL_LIGHT_NAVAL_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_COAL"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_COAL_PORT_PRODUCTION",
    "args": {
      "ConstructibleType": "BUILDING_PORT",
      "Empire": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_COAL"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_COAL_RAILYARD_PRODUCTION",
    "args": {
      "ConstructibleType": "BUILDING_RAIL_STATION",
      "Empire": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_COAL"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COCOA_EXCESS_HAPPINESS",
    "args": {
      "Amount": "3",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_COCOA"
    },
    "effect": "EFFECT_ADJUST_PLAYER_YIELD_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_COFFEE_CITY_BUILDING_PRODUCTION",
    "args": {
      "ConstructibleClass": "BUILDING",
      "Amount": "5",
      "ResourceType": "RESOURCE_COFFEE"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COFFEE_CITY_WONDER_PRODUCTION",
    "args": {
      "ConstructibleClass": "WONDER",
      "Amount": "5",
      "ResourceType": "RESOURCE_COFFEE"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_COTTON_LAND_UNIT_PRODUCTION",
    "args": {
      "Percent": "5",
      "Domain": "DOMAIN_LAND",
      "ResourceType": "RESOURCE_COTTON"
    },
    "effect": "EFFECT_CITY_ADJUST_UNIT_PRODUCTION_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_CITY"
      }
    ],
    "id": "MOD_COWRIE_CITY_FLAT_GOLD",
    "args": {
      "Amount": "6",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_IS_TOWN"
      }
    ],
    "id": "MOD_COWRIE_TOWN_FLAT_SCIENCE",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_COWRIE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_CRABS_WAREHOUSE_FOOD",
    "args": {
      "Amount": "3",
      "Tag": "WAREHOUSE",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_CRABS"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PORT"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_FISH_NON_PORT_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_FISH"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PORT"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_FISH_PORT_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_FISH"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_FURS_NON_RAILYARD_HAPPINESS",
    "args": {
      "YieldType": "YIELD_HAPPINESS",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_FURS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_FURS_RAILYARD_HAPPINESS",
    "args": {
      "YieldType": "YIELD_HAPPINESS",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_FURS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_SETTLEMENT_FLAT_HAPPINESS",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_GOLD"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_GOLD_DISTANT_LANDS_BUILDING_PURCHASE_DISCOUNT",
    "args": {
      "AffectBuildings": "true",
      "Percent": "20",
      "ResourceType": "RESOURCE_GOLD_DISTANT_LANDS"
    },
    "effect": "EFFECT_PLAYER_ADJUST_PURCHASE_EFFICIENCY_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_HARDWOOD_CIVILIAN_PRODUCTION",
    "args": {
      "Percent": "20",
      "UnitClass": "UNIT_CLASS_NON_COMBAT",
      "ResourceType": "RESOURCE_HARDWOOD"
    },
    "effect": "EFFECT_PLAYER_ADJUST_UNIT_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_HORSES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "8",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_HORSES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_IVORY_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_IVORY"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_KAOLIN_CULTURE_PERCENT_YIELD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_CULTURE",
      "ResourceType": "RESOURCE_KAOLIN"
    },
    "effect": "EFFECT_ADJUST_PLAYER_YIELD_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_LIMESTONE_BUILDING_PRODUCTION",
    "args": {
      "Empire": "true",
      "ConstructibleClass": "BUILDING",
      "Amount": "10",
      "ResourceType": "RESOURCE_LIMESTONE"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "7",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_LLAMAS_CITY_FLAT_PRODUCTION",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_LLAMAS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_DESERT_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_DESERT",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_GRASSLAND_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_GRASSLAND",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_MARINE_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_MARINE",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_PLAINS_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_PLAINS",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_TROPICAL_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TROPICAL",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_MARBLE_TUNDRA_WONDER_PRODUCTION",
    "args": {
      "Empire": "true",
      "BiomeType": "BIOME_TUNDRA",
      "Amount": "10",
      "ResourceType": "RESOURCE_MARBLE"
    },
    "effect": "EFFECT_CITY_ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_NICKEL_CITY_GOLD",
    "args": {
      "YieldType": "YIELD_GOLD",
      "PercentMultiplier": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_NICKEL"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_NICKEL_CITY_SCIENCE",
    "args": {
      "YieldType": "YIELD_SCIENCE",
      "PercentMultiplier": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_NICKEL"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_RANGED, UNIT_CLASS_SIEGE"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_NITER_INFANTRY_AND_RANGED_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_NITER"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {},
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILD_QUEUE"
      }
    ],
    "id": "MOD_OIL_FACTORY_PRODUCTION",
    "args": {
      "ConstructibleType": "BUILDING_FACTORY",
      "Empire": "true",
      "Amount": "10",
      "ResourceType": "RESOURCE_OIL"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_CAVALRY, UNIT_CLASS_HEAVY"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_OIL_HEAVY_NAVAL_AND_CAVALRY_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_OIL"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PALACE"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_PEARLS_CAPITAL_HAPPINESS",
    "args": {
      "YieldType": "YIELD_HAPPINESS",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PALACE"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_PEARLS_NON_CAPITAL_HAPPINESS",
    "args": {
      "YieldType": "YIELD_HAPPINESS",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_PEARLS"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_PITCH_FACTORY_PRODUCTION",
    "args": {
      "ConstructibleType": "BUILDING_FACTORY",
      "Amount": "1",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_PITCH"
    },
    "effect": "EFFECT_CITY_ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_PITCH_FACTORY_PRODUCTION_EFFICIENCY",
    "args": {
      "Percent": "10",
      "BuildingType": "BUILDING_FACTORY",
      "ResourceType": "RESOURCE_PITCH"
    },
    "effect": "EFFECT_ADJUST_BUILDING_PRODUCTION_EFFICIENCY_PER_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_QUININE_HEAL_UNIT_PER_TURN",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_QUININE"
    },
    "effect": "EFFECT_UNIT_ADJUST_HEAL_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [],
    "id": "MOD_RICE_CITY_FLAT_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "2",
      "ResourceType": "RESOURCE_RICE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "Tag": "UNIT_CLASS_INFANTRY, UNIT_CLASS_AIRCRAFT"
        },
        "inverse": false,
        "type": "REQUIREMENT_UNIT_TAG_MATCHES"
      }
    ],
    "id": "MOD_RUBBER_INFANTRY_AND_AIR_COMBAT_STRENGTH",
    "args": {
      "Amount": "1",
      "ResourceType": "RESOURCE_RUBBER"
    },
    "effect": "EFFECT_UNIT_ADJUST_COMBAT_STRENGTH_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_UNITS"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PALACE"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_SILK_CAPITAL_CULTURE",
    "args": {
      "YieldType": "YIELD_CULTURE",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_SILK"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_PALACE"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_SILK_NON_CAPITAL_CULTURE",
    "args": {
      "YieldType": "YIELD_CULTURE",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_SILK"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_FOOD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_SETTLEMENT_GOLD",
    "args": {
      "Amount": "1",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_GOLD",
      "ResourceType": "RESOURCE_SILVER"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SILVER_DISTANT_LANDS_UNIT_PURCHASE_DISCOUNT",
    "args": {
      "Percent": "20",
      "AffectUnits": "true",
      "ResourceType": "RESOURCE_SILVER_DISTANT_LANDS"
    },
    "effect": "EFFECT_PLAYER_ADJUST_PURCHASE_EFFICIENCY_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_SPICES_CITY_FLAT_FOOD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SPICES_CITY_FLAT_HAPPINESS",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_HAPPINESS",
      "ResourceType": "RESOURCE_SPICES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_SUGAR_CITY_FLAT_FOOD",
    "args": {
      "Amount": "8",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_SUGAR"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_TEA_SCIENCE_YIELD",
    "args": {
      "Amount": "3",
      "PercentMultiplier": "true",
      "YieldType": "YIELD_SCIENCE",
      "ResourceType": "RESOURCE_TEA"
    },
    "effect": "EFFECT_ADJUST_PLAYER_YIELD_PER_SLOTTED_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_PLAYERS"
  },
  {
    "requirements": [],
    "id": "MOD_TIN_GROWTH_PERCENT",
    "args": {
      "Percent": "3",
      "GlobalSlots": "true",
      "ResourceType": "RESOURCE_TIN"
    },
    "effect": "EFFECT_CITY_ADJUST_GROWTH_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_TOBACCO_NON_RAILYARD_PRODUCTION",
    "args": {
      "YieldType": "YIELD_PRODUCTION",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_TOBACCO"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_TOBACCO_RAILYARD_PRODUCTION",
    "args": {
      "YieldType": "YIELD_PRODUCTION",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_TOBACCO"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": true,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_TRUFFLES_NON_RAILYARD_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "4",
      "ResourceType": "RESOURCE_TRUFFLES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [
      {
        "args": {
          "BuildingType": "BUILDING_RAIL_STATION"
        },
        "inverse": false,
        "type": "REQUIREMENT_CITY_HAS_BUILDING"
      }
    ],
    "id": "MOD_TRUFFLES_RAILYARD_FOOD",
    "args": {
      "YieldType": "YIELD_FOOD",
      "PercentMultiplier": "false",
      "Amount": "8",
      "ResourceType": "RESOURCE_TRUFFLES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WHALES_FLAT_PRODUCTION",
    "args": {
      "Amount": "8",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_WHALES"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WINE_FLAT_FOOD",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_FOOD",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  },
  {
    "requirements": [],
    "id": "MOD_WINE_FLAT_PRODUCTION",
    "args": {
      "Amount": "4",
      "PercentMultiplier": "false",
      "YieldType": "YIELD_PRODUCTION",
      "ResourceType": "RESOURCE_WINE"
    },
    "effect": "EFFECT_CITY_ADJUST_YIELD_PER_RESOURCE",
    "era": "modern",
    "collection": "COLLECTION_ALL_CITIES"
  }
];
