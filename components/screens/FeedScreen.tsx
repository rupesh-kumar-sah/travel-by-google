import React, { useState, useEffect, useRef } from 'react';
import { FeedPost, Comment } from '../../types';
import {
  CameraIcon,
  HeartIcon,
  HeartFilledIcon,
  MessageCircleIcon,
  ShareIcon,
  BookmarkIcon,
  ImageIcon,
  XIcon,
  SparklesIcon,
  ThumbsUpIcon
} from '../Icons';
import {
  getPosts,
  subscribeToPosts,
  createPost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  toggleCommentLike,
  uploadImage,
  initializeDemoPosts
} from '../../services/feedService';

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now.getTime() - postTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${diffInDays}d ago`;
};

// Mock current user
const currentUser = {
  uid: 'user1',
  displayName: 'Travel Explorer',
  photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
  username: '@traveler'
};

interface FeedCardProps {
  post: FeedPost;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onLike,
  onComment,
  onDeletePost,
  onDeleteComment,
  onLikeComment
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
      setShowComments(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const isLiked = post.likes.includes(currentUser.uid);

  return (
    <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-sm">{post.author}</p>
            <p className="text-xs text-gray-400">📍 {post.location}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDeleteMenu(!showDeleteMenu)}
            className="text-gray-400 text-xl"
          >
            ⋯
          </button>
          {showDeleteMenu && post.author === currentUser.displayName && (
            <div className="absolute right-0 top-8 bg-[#2A2A2E] border border-gray-700 rounded-lg py-2 z-10">
              <button
                onClick={() => {
                  onDeletePost(post.id);
                  setShowDeleteMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 text-sm"
              >
                Delete Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="w-full max-h-96 object-cover"
        />
      )}

      <div className="p-4">
        {/* Actions */}
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            {isLiked ? <HeartFilledIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
            <span className="text-sm">{post.likes.length}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-400 hover:text-blue-400"
          >
            <MessageCircleIcon className="w-5 h-5" />
            <span className="text-sm">{post.comments.length}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 ml-auto">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Caption */}
        <p className="text-sm mb-2">
          <span className="font-semibold">{post.author}</span> {post.caption}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag, index) => (
              <span key={index} className="text-xs text-blue-400">#{tag}</span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mb-2">{formatTimeAgo(post.timestamp)}</p>

        {/* Comments */}
        {showComments && (
          <div className="border-t border-gray-700 pt-3 mt-3">
            <h4 className="text-sm font-semibold mb-3">Comments</h4>

            {/* Comment Input */}
            <div className="flex gap-2 mb-3">
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.author}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-800 rounded-lg px-3 py-2">
                      <p className="text-sm font-semibold">{comment.author}</p>
                      <p className="text-sm text-gray-200">{comment.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => onLikeComment(post.id, comment.id)}
                          className={`text-xs ${comment.likes.includes(currentUser.uid) ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          {comment.likes.length > 0 ? `${comment.likes.length} likes` : 'Like'}
                        </button>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: {
    caption: string;
    image?: string;
    location: string;
    postType: 'text' | 'photo' | 'news';
    tags?: string[];
  }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [postType, setPostType] = useState<'text' | 'photo' | 'news'>('photo');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setImage(imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleSubmit = () => {
    if (!caption.trim() || !location.trim()) {
      alert('Please fill in caption and location');
      return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    onSubmit({
      caption: caption.trim(),
      image: image || undefined,
      location: location.trim(),
      postType,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    });

    // Reset form
    setCaption('');
    setLocation('');
    setImage(null);
    setTags('');
    setPostType('photo');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1C1C1E] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Create Post</h2>
            <button onClick={onClose} className="text-gray-400">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Post Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Post Type</label>
            <div className="flex gap-2">
              {[
                { type: 'photo' as const, label: 'Photo', icon: ImageIcon },
                { type: 'text' as const, label: 'Text', icon: SparklesIcon },
                { type: 'news' as const, label: 'News', icon: ThumbsUpIcon }
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    postType === type
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 text-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium mb-2">What's on your mind?</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your travel experience..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you sharing from?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          {(postType === 'photo' || postType === 'news') && (
            <div>
              <label className="block text-sm font-medium mb-2">Photo</label>
              {image ? (
                <div className="relative">
                  <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-500 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CameraIcon className="w-8 h-8 mx-auto mb-1" />
                      <span>Add Photo</span>
                    </div>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!caption.trim() || !location.trim() || isUploading}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize demo posts on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await initializeDemoPosts();
        // Subscribe to real-time updates
        const unsubscribe = subscribeToPosts((postsData) => {
          setPosts(postsData);
          setLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize feed:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleCreatePost = async (postData: {
    caption: string;
    image?: string;
    location: string;
    postType: 'text' | 'photo' | 'news';
    tags?: string[];
  }) => {
    try {
      await createPost({
        ...postData,
        author: currentUser.displayName,
        authorAvatar: currentUser.photoURL,
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId, currentUser.uid);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    try {
      await addComment(postId, {
        author: currentUser.displayName,
        authorAvatar: currentUser.photoURL,
        text: commentText,
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(postId, commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    try {
      await toggleCommentLike(postId, commentId, currentUser.uid);
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Travel Feed</h1>
          <p className="text-gray-400">Share your adventures and connect with travelers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <CameraIcon className="w-5 h-5" />
          Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1C1C1E] border border-gray-800 rounded-2xl p-4">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-1 flex-1">
                    <div className="w-24 h-4 bg-gray-700 rounded"></div>
                    <div className="w-16 h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-full h-48 bg-gray-700 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-700 rounded"></div>
                  <div className="w-48 h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No posts yet</p>
              <p>Be the first to share your travel experience!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Create First Post
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleAddComment}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
                onLikeComment={handleLikeComment}
              />
            ))
          )}
        </div>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />

      <style>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default FeedScreen;
