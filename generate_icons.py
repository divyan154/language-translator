#!/usr/bin/env python3
"""Generate app icons for the Voice Translator PWA"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not installed. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    """Create an app icon with gradient background and microphone symbol"""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)

    # Create gradient effect (simple approximation)
    for y in range(size):
        # Interpolate between two colors
        r1, g1, b1 = 102, 126, 234  # #667eea
        r2, g2, b2 = 118, 75, 162   # #764ba2

        ratio = y / size
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)

        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # Draw microphone icon
    center_x = size // 2
    center_y = size // 2
    mic_height = int(size * 0.25)
    mic_width = int(size * 0.15)
    stroke_width = max(2, int(size * 0.02))

    # Microphone capsule (rounded rectangle approximation)
    mic_top = center_y - mic_height - int(size * 0.1)
    mic_bottom = center_y - int(size * 0.1)
    mic_left = center_x - mic_width // 2
    mic_right = center_x + mic_width // 2

    draw.rounded_rectangle(
        [mic_left, mic_top, mic_right, mic_bottom],
        radius=mic_width // 2,
        fill='white'
    )

    # Microphone stand
    stand_top = mic_bottom
    stand_bottom = center_y + int(size * 0.15)
    draw.line(
        [(center_x, stand_top), (center_x, stand_bottom)],
        fill='white',
        width=stroke_width
    )

    # Microphone base
    base_y = stand_bottom
    base_width = mic_width
    draw.line(
        [(center_x - base_width, base_y), (center_x + base_width, base_y)],
        fill='white',
        width=stroke_width
    )

    # Microphone arc
    arc_radius = int(mic_width * 1.5)
    arc_bbox = [
        center_x - arc_radius,
        mic_bottom - arc_radius,
        center_x + arc_radius,
        mic_bottom + arc_radius
    ]
    draw.arc(arc_bbox, start=200, end=340, fill='white', width=stroke_width)

    # Translation arrows
    arrow_y = center_y + int(size * 0.25)
    arrow_length = int(size * 0.1)
    arrow_size = int(size * 0.03)

    # Left arrow (pointing left)
    left_arrow_end = center_x - int(size * 0.25)
    left_arrow_start = left_arrow_end + arrow_length
    draw.line(
        [(left_arrow_start, arrow_y), (left_arrow_end, arrow_y)],
        fill='white',
        width=stroke_width
    )
    draw.line(
        [(left_arrow_end, arrow_y), (left_arrow_end + arrow_size, arrow_y - arrow_size)],
        fill='white',
        width=stroke_width
    )
    draw.line(
        [(left_arrow_end, arrow_y), (left_arrow_end + arrow_size, arrow_y + arrow_size)],
        fill='white',
        width=stroke_width
    )

    # Right arrow (pointing right)
    right_arrow_start = center_x + int(size * 0.15)
    right_arrow_end = right_arrow_start + arrow_length
    draw.line(
        [(right_arrow_start, arrow_y), (right_arrow_end, arrow_y)],
        fill='white',
        width=stroke_width
    )
    draw.line(
        [(right_arrow_end, arrow_y), (right_arrow_end - arrow_size, arrow_y - arrow_size)],
        fill='white',
        width=stroke_width
    )
    draw.line(
        [(right_arrow_end, arrow_y), (right_arrow_end - arrow_size, arrow_y + arrow_size)],
        fill='white',
        width=stroke_width
    )

    # Save the image
    img.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

if __name__ == '__main__':
    print("Generating app icons...")
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    print("\n✓ All icons generated successfully!")
