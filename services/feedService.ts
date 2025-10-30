export interface Post {
  author: string;
  location: string;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  timestamp: number;
  id: string;
}

const STORAGE_KEY = 'travel_app_posts';

export const addPost = async (post: Omit<Post, 'timestamp' | 'id'>): Promise<void> => {
  const newPost: Post = {
    ...post,
    timestamp: Date.now(),
    id: Date.now().toString(),
  };

  const posts = getPostsFromStorage();
  posts.unshift(newPost);
  savePostsToStorage(posts);
};

export const getPosts = async (): Promise<Post[]> => {
  return getPostsFromStorage();
};

export const savePostsToStorage = (posts: Post[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getPostsFromStorage = (): Post[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading posts from storage:', error);
    return [];
  }
};

export const deletePost = async (id: string): Promise<void> => {
  const posts = getPostsFromStorage();
  const newPosts = posts.filter(post => post.id !== id);
  savePostsToStorage(newPosts);
};

export const updatePost = async (id: string, updatedPost: Omit<Post, 'id' | 'timestamp'>): Promise<void> => {
  const posts = getPostsFromStorage();
  const index = posts.findIndex(post => post.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updatedPost };
    savePostsToStorage(posts);
  }
};
