import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Comment } from "../data/products";
import { addComment, deleteComment, editComment } from "../data/products";

type CommentsSectionProps = {
  productId: string;
  comments: Comment[];
  onCommentsChange: () => void;
};

export default function CommentsSection({
  productId,
  comments,
  onCommentsChange,
}: CommentsSectionProps) {
  const { user, getToken } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        alert("Please log in to comment");
        return;
      }

      await addComment(productId, newComment.trim(), token);
      setNewComment("");
      onCommentsChange();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        alert("Please log in to edit");
        return;
      }

      await editComment(productId, commentId, editContent.trim(), token);
      setEditingId(null);
      setEditContent("");
      onCommentsChange();
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = await getToken();
      if (!token) {
        alert("Please log in to delete");
        return;
      }

      await deleteComment(productId,commentId, token);
      onCommentsChange();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Please log in to comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {editingId === comment.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={isSubmitting || !editContent.trim()}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:bg-gray-400 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {user?.id === comment.userId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
