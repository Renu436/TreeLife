import os
import asyncio
from typing import Any


def _mock_search(query: str) -> dict:
    """Return realistic mock search results for known species."""
    q = query.strip().lower()

    # Map common names and scientific names to mock data keys
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
            "organic_results": [
                {"title": "Neem Tree — Overview and Uses", "link": "https://example.com/neem-overview", "snippet": "The neem tree (Azadirachta indica) is a fast-growing tropical tree native to the Indian subcontinent."},
                {"title": "Medicinal Properties of Neem", "link": "https://example.com/neem-medicine", "snippet": "Neem has been used in Ayurvedic medicine for over 4000 years. Neem oil treats fungal infections, skin diseases, and is a natural insecticide."},
                {"title": "Neem Ecology and Environmental Role", "link": "https://example.com/neem-ecology", "snippet": "Neem trees provide significant carbon sequestration and improve soil fertility. They are drought-resistant and thrive in arid conditions."},
                {"title": "Neem in Agriculture", "link": "https://example.com/neem-agriculture", "snippet": "Neem-based biopesticides are widely used as natural alternatives to synthetic chemicals in sustainable agriculture."},
                {"title": "Neem Research and Scientific Studies", "link": "https://example.com/neem-research", "snippet": "Recent research has identified over 300 bioactive compounds in neem, including azadirachtin, nimbolide, and gedunin."},
                {"title": "Neem Conservation Status", "link": "https://example.com/neem-conservation", "snippet": "Neem is not endangered. It is widely cultivated across tropical and subtropical regions worldwide."},
                {"title": "Neem Geography and Distribution", "link": "https://example.com/neem-geography", "snippet": "Neem is native to India, Nepal, and Myanmar. It is now cultivated across Africa, Southeast Asia, and Central America."},
                {"title": "Neem in Cultural and Religious Traditions", "link": "https://example.com/neem-culture", "snippet": "In Indian culture, neem is considered sacred. It is used in Hindu ceremonies and has been referenced in ancient texts."},
            ],
            "knowledge_graph": {
                "title": "Neem",
                "type": "Deciduous tree",
                "description": "Azadirachta indica, commonly known as neem, is a tree in the mahogany family Meliaceae.",
            },
        },
        "banyan": {
            "organic_results": [
                {"title": "Banyan Tree — The World's Widest Tree", "link": "https://example.com/banyan-overview", "snippet": "The banyan tree (Ficus benghalensis) is famous for its aerial roots that grow down from branches, forming additional trunks."},
                {"title": "Banyan Ecology and Keystone Species", "link": "https://example.com/banyan-ecology", "snippet": "Banyan trees are considered keystone species providing habitat for hundreds of bird and mammal species in tropical forests."},
                {"title": "Sacred Banyan in Hindu and Buddhist Traditions", "link": "https://example.com/banyan-culture", "snippet": "The banyan is the national tree of India and holds deep religious significance in Hinduism and Buddhism."},
                {"title": "Banyan Medicinal Uses", "link": "https://example.com/banyan-medicine", "snippet": "The bark, leaves, and aerial roots of banyan are used in traditional medicine to treat diabetes, dental disorders, and rheumatism."},
                {"title": "Banyan Research — Aerial Root Growth", "link": "https://example.com/banyan-research", "snippet": "Scientific studies have examined the mechanisms by which banyan aerial roots develop into secondary trunks, enabling trees to spread over acres."},
                {"title": "Banyan Distribution and Climate", "link": "https://example.com/banyan-geography", "snippet": "Banyan trees grow in tropical and subtropical climates across India, Bangladesh, Pakistan, and Southeast Asia."},
                {"title": "Banyan Conservation and Urban Trees", "link": "https://example.com/banyan-conservation", "snippet": "Many ancient banyan trees are protected as heritage trees. Urban development threatens banyan habitats in South Asia."},
                {"title": "Banyan as a Fig Tree", "link": "https://example.com/banyan-figs", "snippet": "As a fig tree, banyan produces figs that are a critical food source for fruit bats, birds, and primates."},
            ],
            "knowledge_graph": {
                "title": "Banyan",
                "type": "Evergreen tree",
                "description": "Ficus benghalensis, the banyan tree, is the national tree of India and can spread over several acres.",
            },
        },
        "mango": {
            "organic_results": [
                {"title": "Mango Tree — Tropical Fruit King", "link": "https://example.com/mango-overview", "snippet": "The mango tree (Mangifera indica) is a tropical tree native to South Asia, producing one of the world's most consumed fruits."},
                {"title": "Mango Cultivation and Agriculture", "link": "https://example.com/mango-agriculture", "snippet": "Mango is cultivated in over 100 countries. India leads global production followed by China, Thailand, and Mexico."},
                {"title": "Mango Ecology and Biodiversity", "link": "https://example.com/mango-ecology", "snippet": "Mango trees support diverse ecosystems, providing shade, habitat for birds, and food for wildlife. They help prevent soil erosion."},
                {"title": "Mango Nutrition and Health Benefits", "link": "https://example.com/mango-health", "snippet": "Mangoes are rich in vitamins A, C, and E, as well as polyphenols with antioxidant and anti-inflammatory properties."},
                {"title": "Mango Research — Variety Classification", "link": "https://example.com/mango-research", "snippet": "Over 1000 mango varieties have been cataloged. Alphonso, Kesar, and Haden are among the most commercially important."},
                {"title": "Mango Geography and Native Range", "link": "https://example.com/mango-geography", "snippet": "The mango originated in the Indo-Burma region approximately 5000 years ago and spread to Southeast Asia, East Africa, and the Americas."},
                {"title": "Mango in Indian Culture", "link": "https://example.com/mango-culture", "snippet": "The mango is the national fruit of India. Mango leaves are used in Hindu religious ceremonies and festivals."},
                {"title": "Mango Conservation — Wild Species", "link": "https://example.com/mango-conservation", "snippet": "Wild mango relatives are important for genetic diversity. Habitat loss in the Indo-Burma region threatens wild mango populations."},
            ],
            "knowledge_graph": {
                "title": "Mango",
                "type": "Tropical tree",
                "description": "Mangifera indica, the mango tree, is a flowering plant in the family Anacardiaceae native to South Asia.",
            },
        },
        "teak": {
            "organic_results": [
                {"title": "Teak Wood — Prized Hardwood of the Tropics", "link": "https://example.com/teak-overview", "snippet": "Teak (Tectona grandis) is a large tropical hardwood known for its exceptional durability, water resistance, and golden-brown color."},
                {"title": "Teak Timber Industry and Commercial Uses", "link": "https://example.com/teak-uses", "snippet": "Teak is used extensively in shipbuilding, outdoor furniture, flooring, and construction due to its resistance to rot and insects."},
                {"title": "Teak Ecology in Southeast Asian Forests", "link": "https://example.com/teak-ecology", "snippet": "Teak is a dominant species in dry deciduous forests of Myanmar, Thailand, and India, supporting diverse wildlife communities."},
                {"title": "Teak Plantation Forestry", "link": "https://example.com/teak-plantations", "snippet": "Teak plantations are established across tropical Asia, Africa, and Latin America to meet commercial timber demand sustainably."},
                {"title": "Teak Research — Growth and Yield", "link": "https://example.com/teak-research", "snippet": "Studies show teak reaches harvestable maturity in 30–40 years in plantations, compared to 80+ years in natural forests."},
                {"title": "Teak Conservation Status — IUCN", "link": "https://example.com/teak-conservation", "snippet": "Natural teak forests are classified as vulnerable. Illegal logging and deforestation have severely reduced native teak populations."},
                {"title": "Teak Native Range and Distribution", "link": "https://example.com/teak-geography", "snippet": "Teak is native to South and Southeast Asia: India, Myanmar, Thailand, and Laos. It requires a distinct dry season for growth."},
                {"title": "Teak in Traditional Craftsmanship", "link": "https://example.com/teak-culture", "snippet": "Teak has been used in Southeast Asian temple construction and traditional boat-building for centuries."},
            ],
            "knowledge_graph": {
                "title": "Teak",
                "type": "Tropical hardwood tree",
                "description": "Tectona grandis is a large tropical tree in the family Lamiaceae prized for its durable, weather-resistant timber.",
            },
        },
        "coconut": {
            "organic_results": [
                {"title": "Coconut Palm — Tree of Life", "link": "https://example.com/coconut-overview", "snippet": "The coconut palm (Cocos nucifera) is often called the 'tree of life' due to its extraordinary range of uses from food to construction."},
                {"title": "Coconut Nutrition and Food Uses", "link": "https://example.com/coconut-food", "snippet": "Coconut provides edible flesh, coconut water, coconut milk, and coconut oil — all nutritionally rich and economically important."},
                {"title": "Coconut Ecology and Coastal Ecosystems", "link": "https://example.com/coconut-ecology", "snippet": "Coconut palms stabilize coastal soils, resist salt spray, and provide habitat and food for coastal wildlife including crabs and birds."},
                {"title": "Coconut Industrial and Commercial Applications", "link": "https://example.com/coconut-industry", "snippet": "Coconut husk (coir) is used for ropes and mats. Coconut shells are used for activated charcoal. Coconut oil is a major cosmetics ingredient."},
                {"title": "Coconut Research — Origin and Dispersal", "link": "https://example.com/coconut-research", "snippet": "Genetic research indicates the coconut originated in Southeast Asia and the Pacific and spread globally via oceanic dispersal and human trade."},
                {"title": "Coconut Geography and Tropical Distribution", "link": "https://example.com/coconut-geography", "snippet": "Coconut palms grow in tropical coastal regions worldwide from the Pacific Islands to the Caribbean, Africa, and South Asia."},
                {"title": "Coconut in Cultural Traditions Worldwide", "link": "https://example.com/coconut-culture", "snippet": "The coconut holds ceremonial importance in Hindu, Buddhist, and Pacific Islander cultures. It is used in weddings, offerings, and festivals."},
                {"title": "Coconut Conservation and Climate Threats", "link": "https://example.com/coconut-conservation", "snippet": "Rising sea levels and saltwater intrusion threaten low-lying coconut groves. Lethal yellowing disease has devastated populations in the Caribbean."},
            ],
            "knowledge_graph": {
                "title": "Coconut",
                "type": "Palm tree",
                "description": "Cocos nucifera is a member of the palm family Arecaceae, known as the 'tree of life' for its versatile uses.",
            },
        },
    }

    if key == "generic":
        common = query.strip().title()
        return {
            "organic_results": [
                {"title": f"{common} Tree — Overview", "link": f"https://example.com/{q}-overview", "snippet": f"{common} is a tree species with notable ecological and cultural significance."},
                {"title": f"{common} Ecology", "link": f"https://example.com/{q}-ecology", "snippet": f"{common} plays a role in its native ecosystem supporting local biodiversity."},
                {"title": f"{common} Uses", "link": f"https://example.com/{q}-uses", "snippet": f"{common} has traditional and commercial uses in the regions where it grows."},
                {"title": f"{common} Research", "link": f"https://example.com/{q}-research", "snippet": f"Scientific studies have explored the properties and applications of {common}."},
                {"title": f"{common} Conservation", "link": f"https://example.com/{q}-conservation", "snippet": f"Conservation efforts focus on protecting {common} in its native habitat."},
                {"title": f"{common} Geography", "link": f"https://example.com/{q}-geography", "snippet": f"{common} is distributed across several regions and climate zones."},
                {"title": f"{common} Cultural Significance", "link": f"https://example.com/{q}-culture", "snippet": f"{common} holds cultural and traditional importance in local communities."},
                {"title": f"{common} Biology", "link": f"https://example.com/{q}-biology", "snippet": f"{common} has distinctive biological characteristics that define its growth pattern."},
            ],
            "knowledge_graph": {
                "title": common,
                "type": "Tree species",
                "description": f"{common} is a tree species with ecological and cultural significance.",
            },
        }

    return _data[key]


async def search_tree(query: str) -> dict[str, Any]:
    """Search for tree information. Uses mock data if SERPAPI_KEY is not set."""
    key = os.getenv("SERPAPI_KEY", "").strip()
    if not key:
        return _mock_search(query)

    # Run blocking SDK call in executor
    loop = asyncio.get_event_loop()

    def _run_search():
        from serpapi import GoogleSearch
        params = {
            "q": f"{query} tree species facts ecology uses",
            "api_key": key,
            "num": 10,
        }
        search = GoogleSearch(params)
        return search.get_dict()

    return await loop.run_in_executor(None, _run_search)
