import React from 'react';

const feedPosts = [
  {
    author: 'Sarah Chen',
    location: 'Annapurna Base Camp',
    avatar: 'https://placehold.co/40x40/14b8a6/000000?text=SC',
    image: 'https://placehold.co/400x500/0d0d0d/ffffff?text=ABC',
    likes: 234,
    comments: 18,
    caption: 'Finally made it to ABC! The views are absolutely breathtaking. Best trek of my life! 🇳🇵',
    timestamp: '2 hours ago',
  },
  {
    author: 'David Lee',
    location: 'Pashupatinath Temple',
    avatar: 'https://placehold.co/40x40/14b8a6/000000?text=DL',
    image: 'https://placehold.co/400x500/0d0d0d/ffffff?text=Temple',
    likes: 157,
    comments: 25,
    caption: 'Feeling a deep sense of peace and spirituality at this sacred place. The evening aarti was mesmerizing.',
    timestamp: '1 day ago',
  }
];

const FeedCard: React.FC<typeof feedPosts[0]> = ({ author, location, avatar, image, likes, comments, caption, timestamp }) => (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-bold">{author}</p>
                    <p className="text-xs text-gray-400">📍 {location}</p>
                </div>
            </div>
            <button className="text-gray-400">⋮</button>
        </div>

        <img src={image} alt={`Post from ${location}`} className="w-full h-auto object-cover" />
        
        <div className="p-3">
            <div className="flex items-center gap-4 mb-2">
                <button className="flex items-center gap-1">❤️ <span className="text-sm">{likes}</span></button>
                <button className="flex items-center gap-1">💬 <span className="text-sm">{comments}</span></button>
                <button className="ml-auto">🔗</button>
            </div>
            <p className="text-sm"><span className="font-bold">{author}</span> {caption}</p>
            <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
        </div>
    </div>
);


const FeedScreen: React.FC = () => {
    return (
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Travel Feed</h1>
                <p className="text-gray-400">Share your adventures and get inspired by fellow travelers</p>
            </div>
            <div className="space-y-4">
                {feedPosts.map((post, index) => <FeedCard key={index} {...post} />)}
            </div>
        </div>
    );
};

export default FeedScreen;