import React, { useState, useEffect } from 'react';
import { Post, getPosts, addPost, deletePost, updatePost } from '../../services/feedService';

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type CardProps = Post & {
  timestampDisplay: string;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
};

const FeedCard: React.FC<CardProps> = ({ id, author, location, avatar, image, likes, comments, caption, timestampDisplay, onEdit, onDelete }) => (
  <div className="bg-[#1C1C1E] border border-gray-800 rounded-2xl overflow-hidden">
    <div className="p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-xs text-gray-400">📍 {location}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit({ id, author, location, avatar, image, likes, comments, caption, timestamp: timestampDisplay as any })} className="text-blue-400">✏️</button>
        <button onClick={() => onDelete(id)} className="text-red-400">🗑️</button>
      </div>
    </div>
    <img src={image} alt={`Post from ${location}`} className="w-full h-auto object-cover" />
    <div className="p-3">
      <div className="flex items-center gap-4 mb-2">
        <button className="flex items-center gap-1">❤️ <span className="text-sm">{likes}</span></button>
        <button className="flex items-center gap-1">💬 <span className="text-sm">{comments}</span></button>
        <button className="ml-auto">🔗</button>
      </div>
      <p className="text-sm"><span className="font-bold">{author}</span> {caption}</p>
      <p className="text-xs text-gray-500 mt-2">{timestampDisplay}</p>
    </div>
  </div>
);

const EditForm: React.FC<{ post: Post; onCancel: () => void; onSave: (updated: Omit<Post, 'id' | 'timestamp'>) => void; }> = ({ post, onCancel, onSave }) => {
  const [editData, setEditData] = useState({
    author: post.author,
    location: post.location,
    avatarFile: null as File | null,
    imageFile: null as File | null,
    caption: post.caption,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.author || !editData.caption) return;

    let avatarUrl = post.avatar;
    let imageUrl = post.image;

    if (editData.avatarFile) {
      avatarUrl = await readFileAsDataURL(editData.avatarFile);
    }
    if (editData.imageFile) {
      imageUrl = await readFileAsDataURL(editData.imageFile);
    }

    onSave({
      author: editData.author,
      location: editData.location,
      avatar: avatarUrl,
      image: imageUrl,
      likes: post.likes,
      comments: post.comments,
      caption: editData.caption,
    });
  };

  return (
    <form onSubmit={handleSave} className="bg-[#1C1C1E] p-4 rounded-xl space-y-4 border border-gray-700">
      <input
        type="text"
        placeholder="Your Name"
        value={editData.author}
        onChange={(e) => setEditData({ ...editData, author: e.target.value })}
        className="w-full p-2 rounded bg-gray-700 text-white"
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={editData.location}
        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setEditData({ ...editData, avatarFile: e.target.files?.[0] || null })}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setEditData({ ...editData, imageFile: e.target.files?.[0] || null })}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <textarea
        placeholder="Share your story..."
        value={editData.caption}
        onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
        className="w-full p-2 rounded bg-gray-700 text-white h-20"
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Save
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
};

const FeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author: '',
    location: '',
    avatarFile: null as File | null,
    imageFile: null as File | null,
    caption: '',
  });

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
  };

  const handleSaveEdit = async (updatedPost: Omit<Post, 'id' | 'timestamp'>) => {
    if (editingPostId) {
      await updatePost(editingPostId, updatedPost);
      setEditingPostId(null);
      fetchPosts();
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(id);
      fetchPosts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.caption) return;

    try {
      let avatarUrl = 'https://placehold.co/40x40/14b8a6/000000?text=U';
      let imageUrl = 'https://placehold.co/400x500/0d0d0d/ffffff?text=Post';

      if (formData.avatarFile) {
        avatarUrl = await readFileAsDataURL(formData.avatarFile);
      }
      if (formData.imageFile) {
        imageUrl = await readFileAsDataURL(formData.imageFile);
      }

      await addPost({
        author: formData.author,
        location: formData.location || 'Unknown',
        avatar: avatarUrl,
        image: imageUrl,
        likes: 0,
        comments: 0,
        caption: formData.caption,
      });
      setFormData({
        author: '',
        location: '',
        avatarFile: null,
        imageFile: null,
        caption: '',
      });
      setShowForm(false);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    const now = new Date();
    const postTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Travel Feed</h1>
        <p className="text-gray-400">Share your adventures and get inspired by fellow travelers</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Post'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#1C1C1E] p-4 rounded-xl space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, avatarFile: e.target.files?.[0] || null })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <textarea
            placeholder="Share your story..."
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white h-20"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Post
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-400">No posts yet. Be the first to share your adventure!</p>
          ) : (
            posts.map((post) =>
              editingPostId === post.id ? (
                <EditForm
                  key={post.id}
                  post={post}
                  onCancel={() => setEditingPostId(null)}
                  onSave={handleSaveEdit}
                />
              ) : (
                <FeedCard
                  key={post.id}
                  {...post}
                  timestampDisplay={formatTimestamp(post.timestamp)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              )
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FeedScreen;
