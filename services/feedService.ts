import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../src/firebase';
import { FeedPost, Comment } from '../types';

// Post management
export const createPost = async (postData: Omit<FeedPost, 'id' | 'likes' | 'comments' | 'timestamp'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'posts'), {
    ...postData,
    likes: [],
    comments: [],
    timestamp: new Date().toISOString(),
  });
  return docRef.id;
};

export const getPosts = async (): Promise<FeedPost[]> => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedPost));
};

export const subscribeToPosts = (callback: (posts: FeedPost[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as FeedPost));
    callback(posts);
  });
};

export const deletePost = async (postId: string): Promise<void> => {
  await deleteDoc(doc(db, 'posts', postId));
};

// Like management
export const toggleLike = async (postId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);

  // First get the current likes
  const snapshot = await getDocs(query(collection(db, 'posts')));
  const post = snapshot.docs.find(d => d.id === postId)?.data() as FeedPost;

  if (!post) return;

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await updateDoc(postRef, {
      likes: post.likes.filter(id => id !== userId)
    });
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(userId)
    });
  }
};

// Comment management
export const addComment = async (postId: string, comment: Omit<Comment, 'id' | 'likes' | 'timestamp'>): Promise<void> => {
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(), // Simple ID generation
    likes: [],
    timestamp: new Date().toISOString(),
  };

  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    comments: arrayUnion(newComment)
  });
};

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);

  // Get current post to find and remove the comment
  const snapshot = await getDocs(collection(db, 'posts'));
  const post = snapshot.docs.find(d => d.id === postId)?.data() as FeedPost;

  if (!post) return;

  const updatedComments = post.comments.filter(c => c.id !== commentId);
  await updateDoc(postRef, { comments: updatedComments });
};

export const toggleCommentLike = async (postId: string, commentId: string, userId: string): Promise<void> => {
  const postRef = doc(db, 'posts', postId);

  // Get current post
  const snapshot = await getDocs(collection(db, 'posts'));
  const postData = snapshot.docs.find(d => d.id === postId)?.data() as FeedPost;

  if (!postData) return;

  const updatedComments = postData.comments.map(comment => {
    if (comment.id === commentId) {
      const isLiked = comment.likes.includes(userId);
      return {
        ...comment,
        likes: isLiked
          ? comment.likes.filter(id => id !== userId)
          : [...comment.likes, userId]
      };
    }
    return comment;
  });

  await updateDoc(postRef, { comments: updatedComments });
};

// Image upload
export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Initialize demo posts for development
export const initializeDemoPosts = async () => {
  const demoPosts: Omit<FeedPost, 'id'>[] = [
    {
      author: 'Travel Enthusiast',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      location: 'Kathmandu Valley',
      image: 'https://images.unsplash.com/photo-1605788485215-35990d068502?w=400&h=300&fit=crop',
      caption: 'Exploring the historic streets of Kathmandu! The blend of ancient architecture and vibrant culture is incredible. 🇳🇵',
      likes: ['user1', 'user2'],
      comments: [
        {
          id: '1',
          author: 'Adventure Seeker',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          text: 'Beautiful shots! Planning to visit next month.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: ['user3']
        }
      ],
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      postType: 'photo',
      tags: ['Kathmandu', 'Culture']
    },
    {
      author: 'Mountain Explorer',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      location: 'Annapurna Region',
      caption: 'The Annapurna trail never ceases to amaze me. 15 days of pure adventure! #Trekking #Nepal 🏔️',
      likes: ['user1', 'user4', 'user5'],
      comments: [],
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      postType: 'text',
      tags: ['Annapurna', 'Trekking']
    },
    {
      author: 'Culture Lover',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b416?w=40&h=40&fit=crop&crop=face',
      location: 'Pokhara',
      image: 'https://images.unsplash.com/photo-1544558445-5ff04610463f?w=400&h=300&fit=crop',
      caption: 'Sunset at Phewa Lake is pure magic! Don\'t forget to visit the Tal Barahi Temple on the island. 🏞️',
      likes: ['user2', 'user3'],
      comments: [
        {
          id: '2',
          author: 'Local Guide',
          authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
          text: 'Best time is during the monsoon season for the misty atmosphere!',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          likes: ['user1', 'user4']
        }
      ],
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      postType: 'photo',
      tags: ['Pokhara', 'Nature']
    }
  ];

  // Check if posts already exist
  const existingPosts = await getDocs(collection(db, 'posts'));
  if (existingPosts.size === 0) {
    for (const post of demoPosts) {
      await addDoc(collection(db, 'posts'), post);
    }
  }
};
