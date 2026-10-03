import os
import json
import asyncio
from typing import Any


def _mock_categorize(query: str) -> dict:
    """Return a full KnowledgeData-shaped dict for known species or a generic fallback."""
    q = query.strip().lower()

    _alias_map = {
        "neem": "neem", "azadirachta indica": "neem",
        "banyan": "banyan", "ficus benghalensis": "banyan",
        "mango": "mango", "mangifera indica": "mango",
        "teak": "teak", "tectona grandis": "teak",
        "coconut": "coconut", "cocos nucifera": "coconut",
    }
    key = _alias_map.get(q, "generic")

    _data: dict[str, dict] = {
        "neem": {
            "common_name": "Neem",
            "scientific_name": "Azadirachta indica",
            "tree_type": "deciduous",
            "roots": {
                "origin": "Indian subcontinent",
                "native_regions": "India, Nepal, Myanmar, Pakistan, Bangladesh",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Magnoliopsida",
                    "order": "Sapindales",
                    "family": "Meliaceae",
                    "genus": "Azadirachta",
                    "species": "A. indica",
                },
            },
            "trunk": {
                "height": "15–20 metres",
                "growth_rate": "Fast (up to 1 metre/year when young)",
                "lifespan": "150–200 years",
                "bark": "Dark grey, furrowed, and bitter-tasting",
                "climate": "Tropical and subtropical; drought-tolerant",
            },
            "branches": {
                "ecology": [
                    {"title": "Carbon Sequestration", "content": "A mature neem tree can sequester approximately 4–6 kg of CO₂ per day, making it valuable for urban reforestation.", "sources": ["https://example.com/neem-ecology"], "category": "ecology"},
                    {"title": "Soil Improvement", "content": "Neem leaves and cake improve soil fertility by releasing nitrogen and acting as a natural fertiliser.", "sources": ["https://example.com/neem-ecology"], "category": "ecology"},
                    {"title": "Pollinator Support", "content": "Neem flowers attract bees and other pollinators during the spring flowering season, supporting local insect diversity.", "sources": ["https://example.com/neem-ecology"], "category": "ecology"},
                    {"title": "Drought Resistance", "content": "Neem is one of very few trees that thrives in arid conditions, providing shade and windbreaks in semi-desert regions.", "sources": ["https://example.com/neem-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Medicinal — Ayurvedic Use", "content": "Neem has been central to Ayurvedic medicine for over 4000 years. Bark, leaves, seeds, and oil each have distinct therapeutic applications.", "sources": ["https://example.com/neem-medicine"], "category": "uses"},
                    {"title": "Natural Insecticide", "content": "Azadirachtin, extracted from neem seeds, is a powerful biopesticide used globally as a safe alternative to synthetic pesticides.", "sources": ["https://example.com/neem-agriculture"], "category": "uses"},
                    {"title": "Dental Care", "content": "Neem twigs are used as natural toothbrushes across South Asia. Neem toothpaste and mouthwash products have significant commercial markets.", "sources": ["https://example.com/neem-medicine"], "category": "uses"},
                    {"title": "Timber and Wood", "content": "Neem wood is hard and used for furniture, tool handles, and construction in regions where it is abundant.", "sources": ["https://example.com/neem-overview"], "category": "uses"},
                    {"title": "Cosmetics and Skincare", "content": "Neem oil is widely used in cosmetics, soaps, and skincare products for its antibacterial and antifungal properties.", "sources": ["https://example.com/neem-medicine"], "category": "uses"},
                ],
                "research": [
                    {"title": "Bioactive Compounds", "content": "Over 300 bioactive compounds have been identified in neem, including azadirachtin, nimbolide, gedunin, and salannin.", "sources": ["https://example.com/neem-research"], "category": "research"},
                    {"title": "Anticancer Properties", "content": "Nimbolide from neem has shown promising anticancer activity in laboratory studies, inhibiting cell proliferation in multiple cancer lines.", "sources": ["https://example.com/neem-research"], "category": "research"},
                    {"title": "Antimalarial Research", "content": "Neem leaf extracts have demonstrated antimalarial effects in studies, with limonoids showing activity against Plasmodium falciparum.", "sources": ["https://example.com/neem-research"], "category": "research"},
                    {"title": "Antiviral Studies", "content": "Preliminary research indicates neem compounds may inhibit certain viral pathogens, with ongoing studies examining antiviral mechanisms.", "sources": ["https://example.com/neem-research"], "category": "research"},
                ],
                "conservation": [
                    {"title": "Conservation Status", "content": "Neem is not endangered and is classified as a species of Least Concern. It is widely cultivated and self-seeding in tropical regions.", "sources": ["https://example.com/neem-conservation"], "category": "conservation"},
                    {"title": "Reforestation Role", "content": "Neem is used extensively in reforestation and afforestation projects in sub-Saharan Africa and South Asia due to its fast growth in degraded soils.", "sources": ["https://example.com/neem-conservation"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Range", "content": "Neem is native to the dry forests of the Indian subcontinent, from the foothills of the Himalayas south to Sri Lanka.", "sources": ["https://example.com/neem-geography"], "category": "geography"},
                    {"title": "Global Spread", "content": "Neem has been introduced to over 50 countries across Africa, the Americas, Southeast Asia, and the Pacific as part of agroforestry and reforestation initiatives.", "sources": ["https://example.com/neem-geography"], "category": "geography"},
                    {"title": "Climate Suitability", "content": "Neem thrives in hot, dry climates with annual rainfall between 400 and 1200 mm. It tolerates poor, rocky soils and high temperatures.", "sources": ["https://example.com/neem-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "WHO Recognition", "content": "The World Health Organisation has recognised neem's potential in traditional medicine and supports research into its therapeutic applications.", "sources": ["https://example.com/neem-culture"], "category": "news"},
                    {"title": "Biopesticide Market Growth", "content": "The global neem-based biopesticide market is projected to exceed USD 1 billion by 2028, driven by demand for organic agriculture solutions.", "sources": ["https://example.com/neem-agriculture"], "category": "news"},
                ],
            },
        },
        "banyan": {
            "common_name": "Banyan",
            "scientific_name": "Ficus benghalensis",
            "tree_type": "evergreen",
            "roots": {
                "origin": "Indian subcontinent",
                "native_regions": "India, Bangladesh, Nepal, Pakistan, Sri Lanka",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Magnoliopsida",
                    "order": "Rosales",
                    "family": "Moraceae",
                    "genus": "Ficus",
                    "species": "F. benghalensis",
                },
            },
            "trunk": {
                "height": "20–30 metres",
                "growth_rate": "Moderate",
                "lifespan": "Potentially thousands of years",
                "bark": "Light grey to brownish, with rough texture",
                "climate": "Tropical and subtropical with high humidity",
            },
            "branches": {
                "ecology": [
                    {"title": "Keystone Species", "content": "The banyan is a keystone species. Its figs are a critical food source for over 1000 species of birds, bats, and primates when other fruits are scarce.", "sources": ["https://example.com/banyan-ecology"], "category": "ecology"},
                    {"title": "Aerial Root Ecosystem", "content": "Banyan aerial roots create microhabitats for insects, reptiles, and birds, providing nesting sites and shelter within the canopy structure.", "sources": ["https://example.com/banyan-ecology"], "category": "ecology"},
                    {"title": "Microclimate Creation", "content": "Large banyan trees create significant microclimates, lowering ground temperature by up to 5°C and maintaining higher humidity beneath their canopy.", "sources": ["https://example.com/banyan-ecology"], "category": "ecology"},
                    {"title": "Soil Stabilisation", "content": "Banyan aerial roots that develop into trunks stabilise soil across wide areas, preventing erosion on river banks and hillsides.", "sources": ["https://example.com/banyan-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Traditional Medicine", "content": "Banyan bark, aerial roots, and latex are used in Ayurvedic treatments for diabetes, dental disorders, diarrhoea, and skin conditions.", "sources": ["https://example.com/banyan-medicine"], "category": "uses"},
                    {"title": "Sacred and Ceremonial Use", "content": "The banyan is worshipped in Hinduism as the abode of gods. It is the site of village councils and religious ceremonies across South Asia.", "sources": ["https://example.com/banyan-culture"], "category": "uses"},
                    {"title": "Shade and Urban Cooling", "content": "Banyan trees are planted in cities and towns across South Asia to provide shade and reduce urban heat island effects.", "sources": ["https://example.com/banyan-overview"], "category": "uses"},
                    {"title": "Latex and Rubber", "content": "Banyan latex has been used in traditional contexts as an adhesive and sealant, and is studied for potential rubber applications.", "sources": ["https://example.com/banyan-medicine"], "category": "uses"},
                ],
                "research": [
                    {"title": "Aerial Root Mechanics", "content": "Research has revealed the hydraulic and mechanical mechanisms by which banyan aerial roots colonise the ground and develop into secondary trunks.", "sources": ["https://example.com/banyan-research"], "category": "research"},
                    {"title": "Fig Wasp Mutualism", "content": "Each Ficus species has a specific fig wasp pollinator. Banyan relies on Eupristina masoni for pollination — a highly specialised mutualistic relationship.", "sources": ["https://example.com/banyan-research"], "category": "research"},
                    {"title": "Largest Tree Records", "content": "The Great Banyan Tree in Kolkata covers 1.41 hectares and has 3600 aerial roots, making it the widest tree in the world by canopy coverage.", "sources": ["https://example.com/banyan-overview"], "category": "research"},
                    {"title": "Anti-inflammatory Compounds", "content": "Studies have isolated flavonoids and triterpenoids from banyan bark and leaves with significant anti-inflammatory and antidiabetic properties.", "sources": ["https://example.com/banyan-research"], "category": "research"},
                ],
                "conservation": [
                    {"title": "Heritage Tree Protection", "content": "Many ancient banyan trees are legally protected as heritage trees in India and Sri Lanka. Urban encroachment remains a major threat.", "sources": ["https://example.com/banyan-conservation"], "category": "conservation"},
                    {"title": "Urban Development Threats", "content": "Road widening and construction projects in South Asian cities have led to the removal of significant banyan trees in recent decades.", "sources": ["https://example.com/banyan-conservation"], "category": "conservation"},
                    {"title": "Invasive Potential", "content": "In Florida and Hawaii, banyan trees can spread aggressively in disturbed habitats, threatening native species. Management programmes are in place.", "sources": ["https://example.com/banyan-conservation"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Range", "content": "Banyan is native to the Indian subcontinent, particularly found across the plains and foothills of northern, central, and southern India.", "sources": ["https://example.com/banyan-geography"], "category": "geography"},
                    {"title": "Introduced Range", "content": "Banyan has been introduced to Florida, Hawaii, parts of Southeast Asia, and East Africa, where it sometimes grows invasively.", "sources": ["https://example.com/banyan-geography"], "category": "geography"},
                    {"title": "Altitude Range", "content": "Banyan grows from sea level up to approximately 1000 metres elevation, preferring warm lowland tropical and subtropical climates.", "sources": ["https://example.com/banyan-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "National Tree Status", "content": "The banyan is the national tree of India. Conservation campaigns regularly highlight the importance of protecting ancient specimens.", "sources": ["https://example.com/banyan-culture"], "category": "news"},
                    {"title": "Climate Resilience Studies", "content": "Researchers are studying the banyan as a model for climate-resilient urban trees due to its adaptability and wide canopy coverage.", "sources": ["https://example.com/banyan-research"], "category": "news"},
                ],
            },
        },
        "mango": {
            "common_name": "Mango",
            "scientific_name": "Mangifera indica",
            "tree_type": "tropical",
            "roots": {
                "origin": "Indo-Burma region (modern India/Myanmar border)",
                "native_regions": "India, Bangladesh, Myanmar, Vietnam, Thailand",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Magnoliopsida",
                    "order": "Sapindales",
                    "family": "Anacardiaceae",
                    "genus": "Mangifera",
                    "species": "M. indica",
                },
            },
            "trunk": {
                "height": "35–40 metres",
                "growth_rate": "Moderate (0.5 metres/year)",
                "lifespan": "300+ years, some over 1000 years",
                "bark": "Dark brown, rough and fissured when mature",
                "climate": "Tropical and subtropical; requires dry season for flowering",
            },
            "branches": {
                "ecology": [
                    {"title": "Wildlife Habitat", "content": "Mango trees provide nesting sites for birds and roosting sites for bats. Their fruit feeds monkeys, bats, and a wide range of birds.", "sources": ["https://example.com/mango-ecology"], "category": "ecology"},
                    {"title": "Shade and Microclimate", "content": "Mango's dense canopy creates a cool microclimate beneficial for understory plants and soil moisture retention.", "sources": ["https://example.com/mango-ecology"], "category": "ecology"},
                    {"title": "Soil Erosion Prevention", "content": "Deep-rooted mango trees stabilise sloped terrain and prevent soil erosion in tropical agricultural landscapes.", "sources": ["https://example.com/mango-ecology"], "category": "ecology"},
                    {"title": "Pollinator Attraction", "content": "Mango flowers are rich in nectar, attracting bees, flies, and other pollinators critical for fruit set and agricultural productivity.", "sources": ["https://example.com/mango-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Food and Fruit", "content": "The mango fruit is the world's most consumed tropical fruit. It is eaten fresh, dried, pickled, juiced, and used in culinary preparations globally.", "sources": ["https://example.com/mango-agriculture"], "category": "uses"},
                    {"title": "Nutritional Value", "content": "Mangoes are rich in vitamins A, C, B6, and E, potassium, and antioxidant polyphenols including mangiferin and quercetin.", "sources": ["https://example.com/mango-health"], "category": "uses"},
                    {"title": "Wood and Timber", "content": "Mango wood is used for furniture, flooring, plywood, and musical instruments. It is marketed as an eco-friendly timber from plantation trees.", "sources": ["https://example.com/mango-overview"], "category": "uses"},
                    {"title": "Medicinal Bark and Leaves", "content": "Mango bark is used in traditional medicine for respiratory conditions. Mango leaves in hot water are used as a folk remedy for diabetes management.", "sources": ["https://example.com/mango-health"], "category": "uses"},
                    {"title": "Cultural and Religious Significance", "content": "Mango leaves are used in Hindu auspicious ceremonies. The mango is the national fruit of India and a symbol of love in Indian poetry.", "sources": ["https://example.com/mango-culture"], "category": "uses"},
                ],
                "research": [
                    {"title": "Genetic Diversity", "content": "Over 1000 mango cultivars have been documented. Genetic studies reveal centres of diversity in the Indo-Burma region with significant genetic variation.", "sources": ["https://example.com/mango-research"], "category": "research"},
                    {"title": "Mangiferin Studies", "content": "Mangiferin, a xanthone compound in mango, has been extensively studied for its anti-inflammatory, antidiabetic, and antioxidant properties.", "sources": ["https://example.com/mango-research"], "category": "research"},
                    {"title": "Ripening Mechanisms", "content": "Research has elucidated the ethylene-driven ripening pathway in mango, enabling controlled post-harvest storage and improving shelf life.", "sources": ["https://example.com/mango-research"], "category": "research"},
                ],
                "conservation": [
                    {"title": "Wild Mango Diversity", "content": "Wild Mangifera species in the Indo-Burma biodiversity hotspot are threatened by deforestation. Conservation of wild relatives is critical for breeding programmes.", "sources": ["https://example.com/mango-conservation"], "category": "conservation"},
                    {"title": "Heirloom Varieties", "content": "Many traditional mango varieties are being displaced by commercial cultivars. Initiatives to preserve heirloom varieties are active in India and Southeast Asia.", "sources": ["https://example.com/mango-conservation"], "category": "conservation"},
                    {"title": "Biodiversity Hotspot Protection", "content": "The Indo-Burma biodiversity hotspot, the mango's centre of origin, is one of the world's most threatened with less than 5% of original natural vegetation remaining.", "sources": ["https://example.com/mango-conservation"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Origin", "content": "The mango originated in the Indo-Burma region approximately 5000 years ago and spread across South Asia via ancient trade routes.", "sources": ["https://example.com/mango-geography"], "category": "geography"},
                    {"title": "Global Distribution", "content": "Mango is cultivated in over 100 countries across the tropics and subtropics, with India, China, Thailand, and Indonesia as top producers.", "sources": ["https://example.com/mango-geography"], "category": "geography"},
                    {"title": "Climate Zones", "content": "Mango thrives between 10° and 30° latitude in tropical and subtropical climates. It requires a dry season to stimulate flowering and fruit production.", "sources": ["https://example.com/mango-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "Climate Change Impact", "content": "Rising temperatures and erratic monsoon patterns are affecting mango flowering and fruit set in India, threatening yields of key commercial varieties.", "sources": ["https://example.com/mango-ecology"], "category": "news"},
                    {"title": "Export Market Growth", "content": "Global mango exports continue to grow, with premium varieties like Alphonso commanding high prices in European and North American markets.", "sources": ["https://example.com/mango-agriculture"], "category": "news"},
                ],
            },
        },
        "teak": {
            "common_name": "Teak",
            "scientific_name": "Tectona grandis",
            "tree_type": "deciduous",
            "roots": {
                "origin": "South and Southeast Asia",
                "native_regions": "India, Myanmar, Thailand, Laos",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Magnoliopsida",
                    "order": "Lamiales",
                    "family": "Lamiaceae",
                    "genus": "Tectona",
                    "species": "T. grandis",
                },
            },
            "trunk": {
                "height": "30–40 metres",
                "growth_rate": "Moderate (0.5–0.8 metres/year in plantations)",
                "lifespan": "80–150 years in natural forests",
                "bark": "Greyish-brown, fibrous, and peeling in strips",
                "climate": "Tropical monsoon with a distinct dry season",
            },
            "branches": {
                "ecology": [
                    {"title": "Forest Ecology", "content": "Teak is a dominant canopy species in dry deciduous forests, shaping the forest structure and providing habitat for many species.", "sources": ["https://example.com/teak-ecology"], "category": "ecology"},
                    {"title": "Leaf Litter Role", "content": "Teak's large leaves create a thick leaf litter layer that contributes to soil organic matter and supports ground-dwelling invertebrates.", "sources": ["https://example.com/teak-ecology"], "category": "ecology"},
                    {"title": "Wildlife Support", "content": "Teak forests in Myanmar and India support populations of elephants, tigers, leopards, and deer that rely on the forest ecosystem.", "sources": ["https://example.com/teak-ecology"], "category": "ecology"},
                    {"title": "Carbon Storage", "content": "Natural teak forests store significant quantities of carbon in both biomass and soil, making their conservation important for climate mitigation.", "sources": ["https://example.com/teak-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Premium Timber", "content": "Teak is the world's most prized tropical hardwood. Its natural oil content makes it resistant to water, rot, and insects without treatment.", "sources": ["https://example.com/teak-uses"], "category": "uses"},
                    {"title": "Shipbuilding", "content": "Teak has been used in shipbuilding for centuries and remains the preferred timber for luxury boat decking due to its durability and slip resistance.", "sources": ["https://example.com/teak-uses"], "category": "uses"},
                    {"title": "Furniture and Flooring", "content": "Teak's stability and rich golden-brown colour make it highly valued for outdoor furniture, interior flooring, and architectural features.", "sources": ["https://example.com/teak-uses"], "category": "uses"},
                    {"title": "Traditional Construction", "content": "Teak has been used in Southeast Asian temple and palace construction for centuries. Many centuries-old teak structures remain intact today.", "sources": ["https://example.com/teak-culture"], "category": "uses"},
                ],
                "research": [
                    {"title": "Growth and Yield Studies", "content": "Research shows teak reaches commercial maturity in 30–40 years in managed plantations, significantly less than the 80+ years in natural forests.", "sources": ["https://example.com/teak-research"], "category": "research"},
                    {"title": "Natural Oil Composition", "content": "Studies have characterised teak's natural oil as containing quinones and anthraquinones that provide natural resistance to fungi, termites, and marine boring organisms.", "sources": ["https://example.com/teak-research"], "category": "research"},
                    {"title": "Genetic Provenance Research", "content": "Provenance trials have identified superior teak genetic sources for plantation establishment, improving growth rates and timber quality.", "sources": ["https://example.com/teak-research"], "category": "research"},
                    {"title": "Wood Density and Durability", "content": "Teak wood has a density of approximately 630–720 kg/m³, contributing to its exceptional strength, durability, and resistance to warping and cracking.", "sources": ["https://example.com/teak-research"], "category": "research"},
                ],
                "conservation": [
                    {"title": "IUCN Status", "content": "Natural teak forests are classified as vulnerable. Over 80% of natural teak forest has been lost to logging, agricultural conversion, and land clearing.", "sources": ["https://example.com/teak-conservation"], "category": "conservation"},
                    {"title": "Illegal Logging", "content": "Illegal logging of natural teak in Myanmar, once the world's largest teak producer, has been a major conservation challenge despite national bans.", "sources": ["https://example.com/teak-conservation"], "category": "conservation"},
                    {"title": "Plantation Conservation Role", "content": "Certified sustainable teak plantations reduce pressure on natural forests while meeting commercial timber demand through FSC-certified management.", "sources": ["https://example.com/teak-plantations"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Range", "content": "Teak is naturally distributed across the dry deciduous forests of India, Myanmar (world's largest natural teak reserves), Thailand, and Laos.", "sources": ["https://example.com/teak-geography"], "category": "geography"},
                    {"title": "Plantation Distribution", "content": "Teak plantations are established across tropical Asia, Africa, and Latin America. Indonesia and India are the largest plantation producers globally.", "sources": ["https://example.com/teak-geography"], "category": "geography"},
                    {"title": "Climate Requirements", "content": "Teak requires a tropical monsoon climate with a distinct dry season of 3–5 months and annual rainfall between 1200 and 2500 mm for optimal growth.", "sources": ["https://example.com/teak-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "Myanmar Teak Export Ban", "content": "Myanmar's military government has faced international pressure to halt exports of natural teak logged from protected forests.", "sources": ["https://example.com/teak-conservation"], "category": "news"},
                    {"title": "Carbon Credit Potential", "content": "Teak plantation projects are being registered under voluntary carbon markets as carbon credit generators, adding economic value to reforestation efforts.", "sources": ["https://example.com/teak-plantations"], "category": "news"},
                ],
            },
        },
        "coconut": {
            "common_name": "Coconut",
            "scientific_name": "Cocos nucifera",
            "tree_type": "palm",
            "roots": {
                "origin": "Pacific and Southeast Asia (debated)",
                "native_regions": "Pacific Islands, coastal tropical Asia",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Liliopsida",
                    "order": "Arecales",
                    "family": "Arecaceae",
                    "genus": "Cocos",
                    "species": "C. nucifera",
                },
            },
            "trunk": {
                "height": "20–30 metres",
                "growth_rate": "Slow to moderate (30 cm/year)",
                "lifespan": "80–100 years",
                "bark": "Smooth grey with leaf scar rings; fibrous interior",
                "climate": "Tropical coastal; requires heat, sunlight, and adequate rainfall or irrigation",
            },
            "branches": {
                "ecology": [
                    {"title": "Coastal Stabilisation", "content": "Coconut palms play a vital role in stabilising coastal soils with their fibrous root system, reducing erosion from wave action.", "sources": ["https://example.com/coconut-ecology"], "category": "ecology"},
                    {"title": "Salt Tolerance", "content": "Coconut is highly salt-tolerant, enabling it to grow in coastal zones where few other trees can survive, supporting unique coastal ecosystems.", "sources": ["https://example.com/coconut-ecology"], "category": "ecology"},
                    {"title": "Wildlife Habitat", "content": "Coconut palms provide roosting and nesting habitat for seabirds, bats, and the coconut crab (Birgus latro), the world's largest land invertebrate.", "sources": ["https://example.com/coconut-ecology"], "category": "ecology"},
                    {"title": "Organic Matter Cycling", "content": "Coconut leaves and husks contribute to soil organic matter in tropical coastal areas, supporting diverse soil invertebrate communities.", "sources": ["https://example.com/coconut-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Coconut Water", "content": "Coconut water is the clear liquid inside young coconuts, consumed directly or bottled as a natural electrolyte drink with a growing global market.", "sources": ["https://example.com/coconut-food"], "category": "uses"},
                    {"title": "Coconut Oil", "content": "Coconut oil is extracted from dried coconut meat (copra). It is used in cooking, cosmetics, soaps, and as a biofuel feedstock.", "sources": ["https://example.com/coconut-food"], "category": "uses"},
                    {"title": "Coir Fibre Industry", "content": "Coconut husk fibres (coir) are processed into ropes, mats, upholstery, horticultural growing media, and erosion control blankets.", "sources": ["https://example.com/coconut-industry"], "category": "uses"},
                    {"title": "Shell Applications", "content": "Coconut shells are used to produce activated charcoal for water filtration, handicrafts, and as a fuel source in tropical regions.", "sources": ["https://example.com/coconut-industry"], "category": "uses"},
                    {"title": "Culinary Versatility", "content": "Coconut flesh, milk, cream, and desiccated coconut are integral ingredients in the cuisines of South Asia, Southeast Asia, and the Pacific Islands.", "sources": ["https://example.com/coconut-food"], "category": "uses"},
                ],
                "research": [
                    {"title": "Origin and Dispersal", "content": "Genetic research indicates the coconut has two primary centres of diversity — a Pacific group and a South Asian group — consistent with ancient human-assisted dispersal routes.", "sources": ["https://example.com/coconut-research"], "category": "research"},
                    {"title": "Genome Sequencing", "content": "The coconut genome has been sequenced, enabling research into the genetic basis of disease resistance, oil composition, and salt tolerance.", "sources": ["https://example.com/coconut-research"], "category": "research"},
                    {"title": "Lethal Yellowing Disease", "content": "Lethal yellowing, a phytoplasma disease spread by the planthopper Myndus crudus, has devastated Caribbean and African coconut populations. Resistant varieties are under development.", "sources": ["https://example.com/coconut-conservation"], "category": "research"},
                ],
                "conservation": [
                    {"title": "Climate Threat", "content": "Rising sea levels and increased storm intensity threaten low-lying coastal coconut plantations across Pacific Island nations and the Maldives.", "sources": ["https://example.com/coconut-conservation"], "category": "conservation"},
                    {"title": "Genetic Diversity Conservation", "content": "The International Coconut Genetic Resources Network (COGENT) maintains a global collection of coconut germplasm to preserve genetic diversity for breeding programmes.", "sources": ["https://example.com/coconut-conservation"], "category": "conservation"},
                    {"title": "Disease Resistance Breeding", "content": "Breeding programmes across the Philippines, India, and Jamaica are developing disease-resistant coconut varieties to combat lethal yellowing and other threats.", "sources": ["https://example.com/coconut-conservation"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Range", "content": "The coconut palm is believed to originate from the Pacific and tropical coastal Asia. Its exact native range is uncertain due to ancient human dispersal.", "sources": ["https://example.com/coconut-geography"], "category": "geography"},
                    {"title": "Global Distribution", "content": "Coconut palms grow throughout the tropical coastal belt between 25°N and 25°S latitude, across the Pacific, Indian Ocean, and Caribbean regions.", "sources": ["https://example.com/coconut-geography"], "category": "geography"},
                    {"title": "Major Producers", "content": "Indonesia, Philippines, and India are the world's largest coconut producers, together accounting for over 70% of global production.", "sources": ["https://example.com/coconut-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "Organic Coconut Market", "content": "Global demand for organic coconut products — particularly coconut oil and water — has grown substantially, benefiting smallholder farmers in the Philippines and Sri Lanka.", "sources": ["https://example.com/coconut-industry"], "category": "news"},
                    {"title": "Coconut in Sustainable Packaging", "content": "Coconut shell and husk are increasingly used in sustainable packaging and biomaterial research as alternatives to plastic-derived materials.", "sources": ["https://example.com/coconut-industry"], "category": "news"},
                ],
            },
        },
    }

    if key == "generic":
        common = query.strip().title()
        sci_name = "Species unknown"
        return {
            "common_name": common,
            "scientific_name": sci_name,
            "tree_type": "deciduous",
            "roots": {
                "origin": "Region unknown",
                "native_regions": "Various tropical and subtropical regions",
                "classification": {
                    "kingdom": "Plantae",
                    "phylum": "Tracheophyta",
                    "class": "Unknown",
                    "order": "Unknown",
                    "family": "Unknown",
                    "genus": "Unknown",
                    "species": "Unknown",
                },
            },
            "trunk": {
                "height": "Variable",
                "growth_rate": "Moderate",
                "lifespan": "50–100 years",
                "bark": "Variable texture and colour",
                "climate": "Tropical to subtropical",
            },
            "branches": {
                "ecology": [
                    {"title": "Ecological Role", "content": f"{common} plays a role in its local ecosystem by providing habitat and food sources for wildlife.", "sources": [f"https://example.com/{q}-ecology"], "category": "ecology"},
                    {"title": "Carbon Storage", "content": f"{common} contributes to carbon sequestration in its native forest ecosystem.", "sources": [f"https://example.com/{q}-ecology"], "category": "ecology"},
                    {"title": "Biodiversity Support", "content": f"{common} supports local biodiversity by providing food and habitat for insects, birds, and mammals.", "sources": [f"https://example.com/{q}-ecology"], "category": "ecology"},
                ],
                "uses": [
                    {"title": "Traditional Uses", "content": f"{common} has traditional uses in the communities where it naturally grows, including medicinal and material applications.", "sources": [f"https://example.com/{q}-uses"], "category": "uses"},
                    {"title": "Commercial Potential", "content": f"{common} has potential commercial applications that are being explored by researchers and industry.", "sources": [f"https://example.com/{q}-uses"], "category": "uses"},
                    {"title": "Timber", "content": f"The wood of {common} is used locally for construction and fuel.", "sources": [f"https://example.com/{q}-uses"], "category": "uses"},
                ],
                "research": [
                    {"title": "Scientific Classification", "content": f"Scientific research has contributed to understanding the taxonomy and ecology of {common}.", "sources": [f"https://example.com/{q}-research"], "category": "research"},
                    {"title": "Bioactive Compounds", "content": f"Preliminary studies have identified bioactive compounds in {common} with potential therapeutic properties.", "sources": [f"https://example.com/{q}-research"], "category": "research"},
                    {"title": "Growth Studies", "content": f"Research on the growth patterns and ecological requirements of {common} has provided insights for conservation and cultivation.", "sources": [f"https://example.com/{q}-research"], "category": "research"},
                ],
                "conservation": [
                    {"title": "Habitat Threats", "content": f"{common}'s habitat faces pressures from deforestation, land conversion, and climate change.", "sources": [f"https://example.com/{q}-conservation"], "category": "conservation"},
                    {"title": "Conservation Status", "content": f"The conservation status of {common} requires assessment based on current population data and trend information.", "sources": [f"https://example.com/{q}-conservation"], "category": "conservation"},
                    {"title": "Protection Efforts", "content": f"Local conservation programmes are working to protect {common} in its native range.", "sources": [f"https://example.com/{q}-conservation"], "category": "conservation"},
                ],
                "geography": [
                    {"title": "Native Range", "content": f"{common} is found in tropical and subtropical regions, with specific distribution dependent on climate and soil requirements.", "sources": [f"https://example.com/{q}-geography"], "category": "geography"},
                    {"title": "Distribution", "content": f"{common} occurs across multiple countries within its native range and has been introduced to suitable climate zones elsewhere.", "sources": [f"https://example.com/{q}-geography"], "category": "geography"},
                    {"title": "Climate Requirements", "content": f"{common} grows in climates with adequate rainfall and warm temperatures throughout the year.", "sources": [f"https://example.com/{q}-geography"], "category": "geography"},
                ],
                "news": [
                    {"title": "Recent Developments", "content": f"Recent news has highlighted the importance of {common} in regional biodiversity and conservation discussions.", "sources": [f"https://example.com/{q}-news"], "category": "news"},
                    {"title": "Research Findings", "content": f"New research findings on {common} have expanded understanding of its ecology and potential applications.", "sources": [f"https://example.com/{q}-news"], "category": "news"},
                ],
            },
        }

    return _data[key]


async def categorize_tree(query: str, search_data: dict) -> dict[str, Any]:
    """Categorize tree search data using AI or mock fallback."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return _mock_categorize(query)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        # Build snippets from search results
        snippets = []
        for r in search_data.get("organic_results", [])[:8]:
            snippets.append(f"- {r.get('title', '')}: {r.get('snippet', '')}")
        snippets_text = "\n".join(snippets)

        knowledge_graph = search_data.get("knowledge_graph", {})
        kg_desc = knowledge_graph.get("description", "")

        prompt = f"""You are a tree knowledge expert. Based on the search results below, extract structured information about the tree species.

Tree query: {query}
Knowledge graph: {kg_desc}

Search snippets:
{snippets_text}

Return ONLY valid JSON in this exact structure:
{{
  "common_name": "...",
  "scientific_name": "...",
  "tree_type": "deciduous|evergreen|palm|conifer|tropical|shrub",
  "roots": {{
    "origin": "...",
    "native_regions": "...",
    "classification": {{"kingdom": "Plantae", "phylum": "...", "class": "...", "order": "...", "family": "...", "genus": "...", "species": "..."}}
  }},
  "trunk": {{
    "height": "...", "growth_rate": "...", "lifespan": "...", "bark": "...", "climate": "..."
  }},
  "branches": {{
    "ecology": [{{"title": "...", "content": "...", "sources": ["..."], "category": "ecology"}}],
    "uses": [{{"title": "...", "content": "...", "sources": ["..."], "category": "uses"}}],
    "research": [{{"title": "...", "content": "...", "sources": ["..."], "category": "research"}}],
    "conservation": [{{"title": "...", "content": "...", "sources": ["..."], "category": "conservation"}}],
    "geography": [{{"title": "...", "content": "...", "sources": ["..."], "category": "geography"}}],
    "news": [{{"title": "...", "content": "...", "sources": ["..."], "category": "news"}}]
  }}
}}

Provide at least 3 items per branch category."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        raw = response.choices[0].message.content
        return json.loads(raw)

    except Exception:
        return _mock_categorize(query)
