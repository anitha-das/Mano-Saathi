import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { bodyText, emptyStateClass, inputClass, mutedText } from "../styles/common";

const getRelativeTime = (dateValue) => {
  if (!dateValue) return "just now";

  const diffMs = Date.now() - new Date(dateValue).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getVisibleComments = (comments = []) => {
  return comments.filter((commentObj) => commentObj?.isCommentActive !== false);
};

function CommunityForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});

  const totalComments = useMemo(() => {
    return posts.reduce((count, postObj) => count + getVisibleComments(postObj.comments).length, 0);
  }, [posts]);

  const getPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/forum-api/posts`, { withCredentials: true });
      setPosts(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const createPost = async (event) => {
    event.preventDefault();

    const content = postContent.trim();
    if (!content) return toast.error("Write something before posting");

    try {
      setSubmittingPost(true);
      const res = await axios.post(`${API_BASE_URL}/forum-api/posts`, { feeling: "SHARING", content }, { withCredentials: true });
      setPosts((currentPosts) => [res.data.payload, ...currentPosts]);
      setOpenComments((currentOpen) => ({ ...currentOpen, [res.data.payload._id]: true }));
      setPostContent("");
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmittingPost(false);
    }
  };

  const addComment = async (postId) => {
    try {
      const comment = commentText[postId]?.trim();
      if (!comment) return toast.error("Enter a supportive comment");

      const res = await axios.put(`${API_BASE_URL}/forum-api/comments`, { postId, comment }, { withCredentials: true });
      setPosts((currentPosts) => currentPosts.map((post) => (post._id === postId ? res.data.payload : post)));
      setCommentText((currentText) => ({ ...currentText, [postId]: "" }));
      setOpenComments((currentOpen) => ({ ...currentOpen, [postId]: true }));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  const reportPost = async (postId) => {
    try {
      const reason = window.prompt("Reason for report");
      if (!reason) return;

      const res = await axios.post(`${API_BASE_URL}/forum-api/reports`, { targetType: "POST", post: postId, reason }, { withCredentials: true });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report content");
    }
  };

  const toggleComments = (postId) => {
    setOpenComments((currentOpen) => ({ ...currentOpen, [postId]: !currentOpen[postId] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <section className="text-center px-2">
        <p className="text-[0.68rem] font-bold text-[#1F7A58] uppercase tracking-[0.18em]">Student Community</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-semibold text-[#123F31] tracking-tight leading-tight [font-family:Georgia,serif]">
          Anonymous Student Community Forum
        </h1>
        <p className="mt-4 text-[#33433C] text-base sm:text-lg leading-8 max-w-3xl mx-auto">
          Share what you are carrying, read others with care, and offer supportive comments without revealing your identity.
        </p>
      </section>

      <section className="bg-[#DDEDDD] border border-[#CAE0CE] rounded-lg px-5 sm:px-8 py-5 shadow-[0_12px_28px_rgba(24,76,56,0.08)] flex gap-4 items-start">
        <div className="w-11 h-11 rounded-full bg-[#2E7A58] text-white flex items-center justify-center shrink-0 shadow-[0_10px_22px_rgba(46,122,88,0.22)]">
          <span className="text-xl font-black">i</span>
        </div>
        <div>
          <p className="font-extrabold text-[#214F3F]">Community reminder</p>
          <p className="text-[#33433C] leading-7 mt-1">All posts are anonymous. Be kind, supportive, and thoughtful with every response.</p>
        </div>
      </section>

      <form onSubmit={createPost} className="bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg shadow-[0_18px_40px_rgba(24,76,56,0.11)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <textarea
            className="min-h-28 sm:min-h-[74px] flex-1 bg-transparent px-3 py-3 text-[#253B33] text-base sm:text-lg placeholder:text-[#8A9088] focus:outline-none resize-none leading-8"
            placeholder="Share your thoughts anonymously..."
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            maxLength={900}
          />
          <button
            className="sm:w-36 bg-[#0E4A37] hover:bg-[#166044] text-white font-extrabold rounded-lg px-7 py-4 shadow-[0_12px_24px_rgba(14,74,55,0.24)] hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submittingPost}
          >
            {submittingPost ? "Posting..." : "Post"}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#E4EADF] mt-3 pt-3 px-3">
          <p className={mutedText}>Your post will appear as Anonymous Student.</p>
          <p className="text-xs font-semibold text-[#65756D]">{postContent.length}/900</p>
        </div>
      </form>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#123F31] [font-family:Georgia,serif]">Community posts</h2>
          <p className={mutedText}>{posts.length} anonymous posts | {totalComments} supportive comments</p>
        </div>
      </section>

      <section className="space-y-6">
        {loading && <p className={mutedText}>Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <div className="bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-10 shadow-[0_16px_36px_rgba(24,76,56,0.08)]">
            <p className={emptyStateClass}>Be the first to share your thoughts anonymously and support the community.</p>
          </div>
        )}

        {posts.map((postObj) => {
          const comments = getVisibleComments(postObj.comments);
          const isCommentsOpen = Boolean(openComments[postObj._id]);

          return (
            <article key={postObj._id} className="bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-5 sm:p-7 shadow-[0_16px_36px_rgba(24,76,56,0.09)] hover:shadow-[0_22px_48px_rgba(24,76,56,0.13)] transition duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-full bg-[#CDE5D2] flex items-center justify-center shrink-0 shadow-[inset_0_0_0_1px_rgba(31,122,88,0.12)]">
                    <div className="w-8 h-8 rounded-full bg-[#2E7A58]" />
                    <span className="absolute right-1 bottom-1 w-3.5 h-3.5 rounded-full bg-[#5E8E75] border-2 border-[#FFFDF7]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-[#2B6A51]">Anonymous Student</p>
                      <span className="text-[#8A9088]">|</span>
                      <p className="text-sm text-[#65756D]">{getRelativeTime(postObj.createdAt)}</p>
                    </div>
                    {postObj.feeling && postObj.feeling !== "SHARING" && (
                      <p className="mt-2 w-28 h-1 rounded-full bg-[#C7C9C2]" aria-label={postObj.feeling} />
                    )}
                  </div>
                </div>
                <button className="text-xs font-bold text-[#7B8178] hover:text-[#B76555] transition" onClick={() => reportPost(postObj._id)}>
                  Report
                </button>
              </div>

              <p className={`${bodyText} mt-5 text-base sm:text-lg leading-8 whitespace-pre-wrap`}>{postObj.content}</p>

              <div className="mt-6 border-t border-[#E4EADF] pt-4 flex flex-wrap items-center gap-4">
                <button className="inline-flex items-center gap-2 text-[#2E7A58] hover:text-[#123F31] font-extrabold transition" onClick={() => toggleComments(postObj._id)}>
                  <span className="w-9 h-9 rounded-full bg-[#E3F0E4] flex items-center justify-center">C</span>
                  <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
                </button>
                <p className="text-sm text-[#65756D]">Open the thread to offer support.</p>
              </div>

              {isCommentsOpen && (
                <div className="mt-5 space-y-4">
                  {comments.length > 0 ? (
                    <div className="space-y-3">
                      {comments.map((commentObj) => (
                        <div key={commentObj._id} className="bg-[#F7F8F1] border border-[#DDE7D8] rounded-lg p-4 shadow-[0_8px_20px_rgba(24,76,56,0.05)]">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#D7EAD9] flex items-center justify-center text-[#1F7A58] font-black shrink-0">A</div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-extrabold text-[#214F3F]">
                                  {commentObj.user?.role === "COUNSELOR" ? `Counselor ${commentObj.user?.firstName || ""}` : "Anonymous Supporter"}
                                </p>
                                <span className="text-[#9AA097]">|</span>
                                <p className="text-xs text-[#65756D]">{getRelativeTime(commentObj.createdAt)}</p>
                              </div>
                              <p className="text-sm text-[#33433C] leading-7 mt-1 whitespace-pre-wrap">{commentObj.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#65756D] bg-[#F7F8F1] border border-dashed border-[#C7D7C3] rounded-lg p-4">
                      No comments yet. Be the first to leave a supportive response.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <input
                      className={inputClass}
                      placeholder="Write a supportive comment..."
                      value={commentText[postObj._id] || ""}
                      onChange={(event) => setCommentText((currentText) => ({ ...currentText, [postObj._id]: event.target.value }))}
                    />
                    <button className="shrink-0 bg-[#0E4A37] hover:bg-[#166044] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-[0_10px_22px_rgba(14,74,55,0.22)] transition" onClick={() => addComment(postObj._id)}>
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default CommunityForum;
