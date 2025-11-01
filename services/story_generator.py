def generate_enhanced_story(data):
    """Generate an enhanced story based on input data."""
    artisan_name = data.get('artisanName', 'Unknown Artisan')
    craft_type = data.get('craftType', 'Craft')
    cultural_significance = data.get('culturalSignificance', 'A traditional craft')
    creation_process = data.get('creationProcess', 'Handcrafted with care')

    summary = f"This is the story of {artisan_name}'s {craft_type}, a craft rich in {cultural_significance}."
    full_story = f"{summary} The creation process involves {creation_process}, passed down through generations."

    return {
        'summary': summary,
        'fullStory': full_story,
        'title': f"The Story of {artisan_name}'s {craft_type}"
    }