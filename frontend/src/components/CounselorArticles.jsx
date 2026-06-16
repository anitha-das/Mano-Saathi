import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../api/baseURL";
import { articleGrid, articleCardClass, articleTitle, articleExcerpt, mutedText, dangerBtn, successBtn, emptyStateClass } from "../styles/common";

function CounselorArticles() {
  const [articles, setArticles] = useState([]);

  const getArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/counselor-api/articles`, { withCredentials: true });
      setArticles(res.data.payload || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load articles");
    }
  };

  useEffect(() => {
    getArticles();
  }, []);

  const toggleArticle = async (articleObj) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/counselor-api/articles`, { articleId: articleObj._id, isArticleActive: !articleObj.isArticleActive }, { withCredentials: true });
      setArticles(articles.map((article) => (article._id === articleObj._id ? res.data.payload : article)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update article");
    }
  };

  return (
    <div>
      {articles.length === 0 && <p className={emptyStateClass}>No articles published yet.</p>}
      <div className={articleGrid}>
        {articles.map((articleObj) => (
          <div key={articleObj._id} className={articleCardClass}>
            <p className={mutedText}>{articleObj.category}</p>
            <h3 className={articleTitle}>{articleObj.title}</h3>
            <p className={articleExcerpt}>{articleObj.content}</p>
            <button className={articleObj.isArticleActive ? dangerBtn : successBtn} onClick={() => toggleArticle(articleObj)}>
              {articleObj.isArticleActive ? "Hide" : "Restore"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CounselorArticles;

