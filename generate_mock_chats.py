import json
from datetime import datetime, timedelta
import random

# Load db.json
with open('app/data/db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

groups = data['groups']
users = data['users']

# Chat templates for different group types
chat_templates = {
    'group-001': [  # Singapore Hikers
        ('user-001', 'Anyone up for MacRitchie this Saturday? Weather looks good!'),
        ('community-compass-demo-user', 'Count me in! What time are you thinking?'),
        ('user-005', '7am start? Beat the heat'),
        ('user-020', 'Perfect! I\'ll bring extra water'),
    ],
    'group-002': [  # Coffee Enthusiasts
        ('user-004', 'Just tried the new espresso at Tiong Bahru Bakery 😍'),
        ('user-012', 'How was it? Been meaning to check it out'),
        ('user-003', 'Their cold brew is incredible too'),
    ],
    'group-003': [  # Beach Volleyball
        ('user-009', 'Game on this Sunday at Sentosa! Who\'s in?'),
        ('community-compass-demo-user', 'I\'m in! 🏐'),
        ('user-018', 'What time?'),
        ('user-009', '4pm to catch the sunset!'),
    ],
    'group-004': [  # Code & Coffee
        ('user-003', 'Anyone tried the new React 19 features yet?'),
        ('user-007', 'Yeah! The compiler is game-changing'),
        ('user-013', 'Still on 18 here. Worth upgrading?'),
        ('user-016', 'Definitely. The performance boost is real'),
    ],
    'group-005': [  # Urban Photography
        ('user-004', 'Golden hour at Marina Bay tomorrow. Join me?'),
        ('user-010', 'Yes! Need to test my new lens'),
        ('user-020', 'What time are we meeting?'),
        ('community-compass-demo-user', '6:30pm at Marina Barrage?'),
    ],
    'group-006': [  # Yoga in the Park
        ('user-002', 'This Sunday\'s session will focus on backbends'),
        ('user-008', 'Perfect! Need to work on my flexibility'),
        ('user-019', 'Should I bring my own mat?'),
        ('user-002', 'Yes please! And maybe a towel'),
    ],
    'group-007': [  # Board Game Nights
        ('user-006', 'Tonight: Catan tournament! 🎲'),
        ('user-003', 'I call dibs on sheep strategy'),
        ('user-013', '😂 Good luck with that'),
    ],
    'group-008': [  # Trail Runners
        ('user-005', '10k trail run this Saturday at MacRitchie'),
        ('user-008', 'What\'s the elevation gain?'),
        ('user-020', 'Roughly 150m. Not too bad!'),
    ],
    'group-009': [  # Indie Music Lovers
        ('user-006', 'Anyone catch the show at Esplanade last night?'),
        ('user-010', 'YES! The opening act was amazing'),
        ('user-019', 'Bummed I missed it. Any recordings?'),
        ('user-012', 'Check their Instagram stories'),
    ],
    'group-010': [  # Green Singapore
        ('user-016', 'Beach cleanup this Sunday at East Coast'),
        ('user-003', 'Count me in! What should I bring?'),
        ('community-compass-demo-user', 'Gloves and reusable bags'),
    ],
    'group-011': [  # Rock Climbing
        ('user-005', 'New routes at Climb Central Kallang!'),
        ('user-020', 'What grade?'),
        ('user-015', 'Saw a 6c that looks challenging'),
    ],
    'group-012': [  # Bookworms
        ('user-012', 'Next month: "The Midnight Library"'),
        ('user-014', 'Love that book! So many emotions'),
        ('user-002', 'Adding to my reading list now'),
    ],
    'group-013': [  # Sunset Photography
        ('user-001', 'Gardens by the Bay tomorrow for golden hour?'),
        ('community-compass-demo-user', 'Perfect! The supertrees look amazing at sunset'),
        ('user-004', 'I\'ll bring my tripod'),
    ],
    'group-014': [  # Craft Beer Tasting
        ('user-011', 'New IPA at Little Island Brewing Co'),
        ('user-019', 'How hoppy are we talking?'),
        ('user-011', 'Very. 70 IBU 🍺'),
    ],
    'group-015': [  # Morning Meditation
        ('user-015', 'Tomorrow\'s session: loving-kindness meditation'),
        ('user-002', 'Beautiful! Just what I need'),
        ('user-018', 'What time do we start?'),
        ('user-015', '6:30am sharp'),
    ],
    'group-016': [  # Tech Startup Founders
        ('user-001', 'Anyone applying for Antler batch 8?'),
        ('user-007', 'Working on my application now'),
        ('user-013', 'Already submitted! Fingers crossed 🤞'),
        ('user-017', 'Let\'s do a practice pitch session'),
    ],
    'group-017': [  # Weekend BBQ Masters
        ('user-011', 'BBQ this Saturday! Bringing ribs'),
        ('user-014', 'I\'ll make potato salad'),
    ],
    'group-018': [  # Dog Park Regulars
        ('user-016', 'Bishan park tomorrow morning?'),
        ('community-compass-demo-user', 'Yes! My dog needs to burn some energy'),
    ],
    'group-019': [  # Dance Fitness
        ('user-008', 'New choreo this week! 💃'),
        ('user-018', 'Can\'t wait! Last week was so fun'),
        ('user-006', 'Intensity level?'),
        ('user-008', 'High energy! Bring water'),
    ],
    'group-020': [  # Film & Discussion
        ('user-015', 'This week: "Everything Everywhere All at Once"'),
        ('user-018', 'Such a masterpiece'),
        ('user-003', 'Discussion topics?'),
        ('user-015', 'Multiverse theory and family dynamics'),
    ],
}

# Generate messages
messages = []
base_time = datetime.utcnow() - timedelta(days=3)

for group_id, chats in chat_templates.items():
    for i, (user_id, msg_text) in enumerate(chats):
        # Stagger messages over time
        msg_time = base_time + timedelta(hours=i*2, minutes=random.randint(0, 30))
        
        # Find user name
        user = next((u for u in users if u['id'] == user_id), None)
        user_name = user['name'] if user else 'Unknown User'
        
        message = {
            'id': f'msg-{group_id}-{i}',
            'group_id': group_id,
            'user_id': user_id,
            'user_name': user_name,
            'message': msg_text,
            'timestamp': msg_time.isoformat()
        }
        messages.append(message)

# Add to database
data['messages'] = messages

# Save
with open('app/data/db.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f'✅ Generated {len(messages)} mock messages across {len(chat_templates)} groups!')
