import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Post {
  id: string;
  userId: string;
  userEmail: string;
  text: string;
  imageUrl?: string;
  likes: string[];
  commentsCount: number;
  createdAt: number;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    toggleLike: (state, action: PayloadAction<{ postId: string; userId: string }>) => {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) {
        const index = post.likes.indexOf(action.payload.userId);
        if (index === -1) {
          post.likes.push(action.payload.userId);
        } else {
          post.likes.splice(index, 1);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPosts, addPost, toggleLike, setLoading } = postsSlice.actions;
export default postsSlice.reducer;