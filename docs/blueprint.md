# **App Name**: ChromaChron

## Core Features:

- Color Gradient Canvas: A canvas element filled with a color gradient limited to hex values that are numbers only (0-9).
- Hex to Date Conversion: Convert the selected hex color value (YYMMDD) into a date, where YY is reinterpreted based on current year. Values between 00-current year, count as 20**, above that range count as 19**.
- Date Display: Display the converted date in a readable format.
- Date Validation: A tool using generative AI that flags and alerts the user to date values which will be set in the past using information available from the user agent, like the current date.

## Style Guidelines:

- Primary color: Light purple (#D0A5FF). Chosen for its gentle contrast with the primarily numerical color scheme of the date picker itself. Purple tones also connote artificiality, which subtly emphasizes the project's core goal of mis-application.
- Background color: Very light purple (#F5F0FE). Keeps the palette minimal and avoids distracting the eye from the primary UI element.
- Accent color: Soft pink (#FFD0E0). This draws user attention to key interactive elements.
- Font: 'Inter', a sans-serif font, for clarity.
- Minimal icons used, to avoid distractions
- Simple, centered layout to keep focus on color picking. Date display is clear and readable below the color gradient.
- Subtle animation on date display upon color selection.