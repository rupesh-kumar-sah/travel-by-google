import React, { useState, useEffect, useRef } from 'react';
import { FeedPost } from '../../types';
import { PlusIcon, UploadIcon, SparklesIcon, TrashIcon, ChevronDownIcon, HeartIcon, BookmarkIcon } from '../Icons';
import { generatePostImage, analyzePostImage } from '../../services/geminiService';


const initialFeedPosts: FeedPost[] = [
  {
    id: 1,
    author: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    location: 'Annapurna Base Camp',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=400&auto=format&fit=crop',
    likes: 234,
    comments: 18,
    caption: 'Finally made it to ABC! The views are absolutely breathtaking. Best trek of my life! 🇳🇵',
    timestamp: '2 hours ago',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 2,
    author: 'David Lee',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    location: 'Pashupatinath Temple',
    image: 'https://images.unsplash.com/photo-1544439232-354e3a950da0?q=80&w=400&auto=format&fit=crop',
    likes: 157,
    comments: 25,
    caption: 'Feeling a deep sense of peace and spirituality at this sacred place. The evening aarti was mesmerizing.',
    timestamp: '1 day ago',
    isLiked: false,
    isSaved: true,
  }
];

const FeedCard: React.FC<FeedPost & { onDelete: (id: number) => void; onLikeToggle: (id: number) => void; onSaveToggle: (id: number) => void; }> = ({ id, author, location, authorAvatar, image, likes, comments, caption, timestamp, isLiked, isSaved, onDelete, onLikeToggle, onSaveToggle }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef(0);
    const currentTranslateX = useRef(0);
    const isDragging = useRef(false);

    const DELETE_THRESHOLD = -100;

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        isDragging.current = true;
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current || !cardRef.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchStartX.current;
        
        // Only allow swiping left
        if (diff < 0) {
            currentTranslateX.current = diff;
            cardRef.current.style.transform = `translateX(${diff}px)`;
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current || !cardRef.current) return;
        isDragging.current = false;
        
        cardRef.current.style.transition = 'transform 0.3s ease-out';
        
        if (currentTranslateX.current < DELETE_THRESHOLD) {
            // Vibrate for feedback if supported
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
            // Animate out and delete
            if(containerRef.current) {
                cardRef.current.style.transform = 'translateX(-110%)';
                containerRef.current.style.transition = 'max-height 0.4s ease-in, margin-bottom 0.4s ease-in, opacity 0.3s ease-in';
                containerRef.current.style.maxHeight = '0px';
                containerRef.current.style.marginBottom = '0px';
                containerRef.current.style.opacity = '0';
                
                setTimeout(() => onDelete(id), 400);
            }
        } else {
            // Snap back
            cardRef.current.style.transform = 'translateX(0px)';
        }
        currentTranslateX.current = 0;
    };

    return (
        <div ref={containerRef} className="relative transition-all duration-400 ease-in-out" style={{ maxHeight: '1000px' }}>
            <div className="absolute inset-0 bg-red-600 rounded-2xl flex items-center justify-end pr-8" aria-hidden="true">
                <TrashIcon className="w-6 h-6 text-white" />
            </div>
            <div
                ref={cardRef}
                className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y' }}
            >
                <div className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={authorAvatar} alt={author} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold">{author}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">📍 {location}</p>
                        </div>
                    </div>
                    <button className="text-gray-500 dark:text-gray-400">⋮</button>
                </div>

                <img src={image} alt={`Post from ${location}`} className="w-full h-auto object-cover aspect-[4/5]" />
                
                <div className="p-3">
                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                        <button onClick={() => onLikeToggle(id)} className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                            <HeartIcon filled={isLiked} className="w-6 h-6" />
                            <span className="text-sm font-medium">{likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <span className="text-sm font-medium">{comments}</span>
                        </button>
                        <button onClick={() => onSaveToggle(id)} className={`ml-auto transition-colors ${isSaved ? 'text-teal-500 dark:text-teal-400' : ''}`}>
                            <BookmarkIcon filled={isSaved} className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm mt-2"><span className="font-bold">{author}</span> {caption}</p>
                    <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
                </div>
            </div>
        </div>
    );
};

const CreatePostModal: React.FC<{ onClose: () => void; onPost: (post: Omit<FeedPost, 'id' | 'likes' | 'comments' | 'timestamp'>) => void; }> = ({ onClose, onPost }) => {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setSuggestionError(''); 
                setGenerationError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!location) {
            setGenerationError("Please enter a location to generate an image.");
            return;
        }
        setIsGenerating(true);
        setGenerationError('');
        try {
            const prompt = `A beautiful, vibrant, high-quality travel photograph of ${location}, Nepal.`;
            const base64Image = await generatePostImage(prompt);
            setImage(`data:image/png;base64,${base64Image}`);
        } catch (error) {
            console.error("Image generation failed:", error);
            setGenerationError("Failed to generate image. The AI may be busy, please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAiSuggestions = async () => {
        if (!image || isSuggesting) return;
        setIsSuggesting(true);
        setSuggestionError('');
        try {
            const match = image.match(/^data:(image\/\w+);base64,(.*)$/);
            if (!match) {
                throw new Error("Invalid image format. Please upload a standard image file.");
            }
            const mimeType = match[1];
            const base64Data = match[2];

            const suggestions = await analyzePostImage(base64Data, mimeType);
            if (suggestions.location) setLocation(suggestions.location);
            if (suggestions.caption) setCaption(suggestions.caption);

        } catch (error) {
            console.error("AI suggestion failed:", error);
            setSuggestionError(error instanceof Error ? error.message : "Couldn't get suggestions. Please try again.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = () => {
        if (!caption || !location || !image) {
            alert("Please provide a location, caption, and an image to create a post.");
            return;
        }
        onPost({
            author: 'Alex Chen', // Using mock logged-in user
            authorAvatar: 'https://i.pravatar.cc/150?u=alexchen',
            location,
            image,
            caption,
        });
    };

    return (
        <div className="fixed inset-0 max-w-md mx-auto z-50 bg-black/70 backdrop-blur-sm flex flex-col" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-[#101010] w-full flex-1 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400">Cancel</button>
                    <h2 className="text-xl font-bold">New Post</h2>
                    <button onClick={handleSubmit} className="font-bold text-teal-500 dark:text-teal-400 disabled:text-gray-400 dark:disabled:text-gray-600" disabled={!caption || !location || !image}>Post</button>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {/* Image Preview & Actions */}
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center relative overflow-hidden">
                        {image ? (
                           <>
                                <img src={image} alt="Post preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/80 transition-colors"
                                >
                                    Change
                                </button>
                           </>
                        ) : (
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <UploadIcon className="w-10 h-10 mb-2" />
                                <span className="font-semibold">Upload a Photo</span>
                                <span className="text-xs">Tap here to select from your device</span>
                            </button>
                        )}
                        {isGenerating && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                                <SparklesIcon className="w-8 h-8 text-yellow-300 animate-pulse mb-2" />
                                <p className="text-sm text-yellow-300">Generating with AI...</p>
                            </div>
                        )}
                    </div>
                     <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    
                    {image && (
                        <div className="space-y-2">
                            <button
                                onClick={handleAiSuggestions}
                                disabled={isSuggesting}
                                className="w-full flex items-center justify-center gap-2 bg-purple-500/20 text-purple-600 dark:text-purple-200 py-3 rounded-lg border border-purple-500/50 disabled:opacity-50 hover:bg-purple-500/30 transition-colors"
                            >
                                {isSuggesting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        <span>Analyzing image...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5"/> 
                                        <span>Suggest Location & Caption with AI</span>
                                    </>
                                )}
                            </button>
                            {suggestionError && <p className="text-xs text-red-400 text-center">{suggestionError}</p>}
                        </div>
                    )}

                    {/* AI Generation Option */}
                    {!image && (
                        <div className="space-y-2">
                           <div className="flex items-center">
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                                <span className="flex-shrink mx-4 text-gray-500 text-xs">OR</span>
                                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                            </div>
                            <button 
                                onClick={handleGenerateImage} 
                                disabled={isGenerating} 
                                className="w-full flex items-center justify-center gap-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-200 py-3 rounded-lg border border-yellow-500/50 disabled:opacity-50 hover:bg-yellow-500/30 transition-colors"
                            >
                               <SparklesIcon className="w-5 h-5"/> 
                               <span>Generate Image with AI</span>
                            </button>
                            {generationError && <p className="text-xs text-red-400 text-center mt-2">{generationError}</p>}
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-3 pt-2">
                         <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Location (e.g., Pokhara, Nepal)"
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                         <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={4}
                            placeholder="Write a caption..."
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

const FeedScreen: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>(() => {
        try {
            const savedPosts = localStorage.getItem('feedPosts');
            const parsedPosts = savedPosts ? JSON.parse(savedPosts) : initialFeedPosts;
            // Ensure all posts have the isLiked/isSaved property for backwards compatibility
            return parsedPosts.map((post: FeedPost) => ({ 
                ...post, 
                isLiked: post.isLiked || false,
                isSaved: post.isSaved || false,
            }));
        } catch (error) {
            console.error("Failed to parse feed posts from localStorage", error);
            return initialFeedPosts;
        }
    });
    const [isCreatingPost, setIsCreatingPost] = useState(false);

    // State and refs for pull-to-refresh
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullPosition, setPullPosition] = useState(0);
    const touchStartY = useRef(0);
    const isDragging = useRef(false);

    const REFRESH_THRESHOLD = 80;

    useEffect(() => {
        localStorage.setItem('feedPosts', JSON.stringify(posts));
    }, [posts]);
    
    const handleDeletePost = (idToDelete: number) => {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== idToDelete));
    };
    
    const handleLikeToggle = (idToLike: number) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === idToLike) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    };
                }
                return post;
            })
        );
    };

    const handleSaveToggle = (idToSave: number) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post.id === idToSave) {
                    return { ...post, isSaved: !post.isSaved };
                }
                return post;
            })
        );
    };

    const handleCreatePost = (newPostData: Omit<FeedPost, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
        const newPost: FeedPost = {
            id: Date.now(),
            likes: 0,
            comments: 0,
            timestamp: 'Just now',
            isLiked: false,
            isSaved: false,
            ...newPostData,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setIsCreatingPost(false);
    };

    const handleRefresh = () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        setPullPosition(60); // Snap to loading position

        setTimeout(() => {
            try {
                const savedPosts = localStorage.getItem('feedPosts');
                const parsedPosts = savedPosts ? JSON.parse(savedPosts) : initialFeedPosts;
                // To simulate a refresh, we parse the latest from localStorage.
                setPosts(parsedPosts.map((post: FeedPost) => ({ 
                    ...post, 
                    isLiked: post.isLiked || false,
                    isSaved: post.isSaved || false,
                })));
            } catch (error) {
                console.error("Failed to parse feed posts from localStorage during refresh", error);
            }
            
            // End refreshing
            setIsRefreshing(false);
            setPullPosition(0); // Animate back up
        }, 1500); // Simulate network delay
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (isRefreshing) return;
        const mainScroller = document.querySelector('main');
        if (mainScroller && mainScroller.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
            isDragging.current = true;
        } else {
            isDragging.current = false;
        }
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0) {
            // Apply a rubber band effect
            const pullAmount = Math.pow(diff, 0.85);
            setPullPosition(pullAmount);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging.current) return;
        isDragging.current = false;

        if (pullPosition > REFRESH_THRESHOLD) {
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
            handleRefresh();
        } else {
            setPullPosition(0); // Snap back if not pulled enough
        }
    };

    return (
        <>
            <div 
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    transform: `translateY(${pullPosition}px)`,
                    transition: isDragging.current ? 'none' : 'transform 0.3s ease'
                }}
            >
                {/* Refresh Indicator */}
                <div 
                    className="absolute top-0 left-0 right-0 flex justify-center items-center"
                    style={{ 
                        top: '-50px', 
                        height: '50px',
                    }}
                >
                    {isRefreshing ? (
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-teal-500 rounded-full animate-spin"></div>
                    ) : (
                        <ChevronDownIcon 
                            className="w-6 h-6 text-gray-400 transition-transform" 
                            style={{ 
                                opacity: Math.min(pullPosition / REFRESH_THRESHOLD, 1),
                                transform: `rotate(${pullPosition > REFRESH_THRESHOLD ? '180deg' : '0deg'})` 
                            }}
                        />
                    )}
                </div>
                
                <div className="p-4">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Travel Feed</h1>
                            <p className="text-gray-500 dark:text-gray-400">Share your adventures and get inspired</p>
                        </div>
                        <button
                            onClick={() => setIsCreatingPost(true)}
                            className="flex-shrink-0 flex items-center gap-2 bg-teal-500 text-black font-semibold px-4 py-2 rounded-full shadow-md hover:bg-teal-600 transition-colors"
                            aria-label="Create new post"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">New Post</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <FeedCard key={post.id} {...post} onDelete={handleDeletePost} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} />
                        ))}
                    </div>
                </div>
            </div>

            {isCreatingPost && <CreatePostModal onClose={() => setIsCreatingPost(false)} onPost={handleCreatePost} />}
        </>
    );
};

export default FeedScreen;