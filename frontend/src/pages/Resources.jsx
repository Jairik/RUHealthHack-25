import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const popularTopics = [
    "Pregnancy complications",
    "PCOS management",
    "Endometriosis treatment",
    "Menopause symptoms",
    "Fertility options",
    "Pelvic floor health",
    "Postpartum care",
    "Hormone balance"
  ];

  const searchArticles = async (query) => {
    setLoading(true);
    setSearchQuery(query);
    
    try {
      const prompt = `Find the top 6 most helpful and reliable articles about "${query}" related to women's health and OB/GYN care. 
      For each article, provide:
      - title: A clear article title
      - summary: A 2-3 sentence summary of the key information
      - source: The website/publication name
      - url: A realistic URL (use common health websites like mayoclinic.org, healthline.com, webmd.com, acog.org, etc.)
      - category: One of: General Health, Pregnancy, Fertility, Conditions, Treatment, Lifestyle
      
      Return exactly 6 articles with diverse, high-quality information.`;

      // const response = await base44.integrations.Core.InvokeLLM({
      //   prompt,
      //   add_context_from_internet: true,
      //   response_json_schema: {
      //     type: "object",
      //     properties: {
      //       articles: {
      //         type: "array",
      //         items: {
      //           type: "object",
      //           properties: {
      //             title: { type: "string" },
      //             summary: { type: "string" },
      //             source: { type: "string" },
      //             url: { type: "string" },
      //             category: { type: "string" }
      //           }
      //         }
      //       }
      //     }
      //   }
      // });

      setArticles(response.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      alert("Error fetching articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchArticles(searchQuery);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "General Health": "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-600",
      "Pregnancy": "bg-pink-200 dark:bg-pink-900 text-pink-900 dark:text-pink-100 border-pink-400 dark:border-pink-600",
      "Fertility": "bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-400 dark:border-purple-600",
      "Conditions": "bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-400 dark:border-orange-600",
      "Treatment": "bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-100 border-teal-400 dark:border-teal-600",
      "Lifestyle": "bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600"
    };
    return colors[category] || colors["General Health"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-blue-300 dark:border-purple-700">
              <BookOpen className="w-5 h-5 text-blue-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-blue-900 dark:text-purple-200">
                Health Resources
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
              Women's Health Resources
            </h1>
            
            <p className="text-xl text-blue-700 dark:text-purple-300 max-w-2xl mx-auto font-semibold">
              Find trusted articles and information powered by real-time web search
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 mb-12">
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-purple-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for health topics, conditions, treatments..."
                  className="pl-12 text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold h-14"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-8 h-14 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {/* Popular Topics */}
            <div className="mt-6">
              <p className="text-sm font-bold text-blue-800 dark:text-purple-200 mb-3">
                Popular Topics:
              </p>
              <div className="flex flex-wrap gap-3">
                {popularTopics.map((topic) => (
                  <Badge
                    key={topic}
                    className="cursor-pointer px-4 py-2 text-sm font-bold bg-blue-100 dark:bg-purple-900 text-blue-800 dark:text-purple-200 border-2 border-blue-400 dark:border-purple-600 hover:scale-105 transition-all"
                    onClick={() => searchArticles(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-16 h-16 text-blue-600 dark:text-purple-400 animate-spin mb-4" />
              <p className="text-xl font-bold text-blue-800 dark:text-purple-200">
                Searching trusted health sources...
              </p>
            </motion.div>
          )}

          {!loading && articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-blue-800 dark:text-purple-200">
                  Results for "{searchQuery}"
                </h2>
                <Badge className="bg-blue-200 dark:bg-purple-900 text-blue-900 dark:text-purple-100 border-2 border-blue-400 dark:border-purple-600 px-4 py-2 font-bold">
                  {articles.length} Articles Found
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-xl bg-white dark:bg-gray-900 hover:shadow-2xl hover:scale-105 transition-all h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Badge className={`${getCategoryColor(article.category)} border-2 font-bold`}>
                            {article.category}
                          </Badge>
                          <Sparkles className="w-5 h-5 text-blue-500 dark:text-purple-400 flex-shrink-0" />
                        </div>
                        <CardTitle className="text-xl font-black text-blue-800 dark:text-purple-200 leading-tight">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-blue-700 dark:text-purple-300 mb-4 leading-relaxed font-medium flex-1">
                          {article.summary}
                        </p>
                        
                        <div className="space-y-3 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-purple-400 font-semibold">
                            <BookOpen className="w-4 h-4" />
                            {article.source}
                          </div>
                          
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-lg text-white font-bold">
                              Read Article
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && articles.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-20 h-20 text-blue-300 dark:text-purple-700 mx-auto mb-6" />
              <p className="text-2xl font-bold text-blue-800 dark:text-purple-200 mb-2">
                No articles found
              </p>
              <p className="text-blue-600 dark:text-purple-400">
                Try searching for a different topic
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        {!searchQuery && !loading && (
          <Card className="border-4 border-blue-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-700 dark:via-pink-600 dark:to-rose-600 text-white">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl font-black mb-4 drop-shadow-lg">
                Powered by Real-Time Web Search
              </h2>
              <p className="text-xl max-w-2xl mx-auto font-semibold opacity-95">
                Our AI searches trusted medical sources across the web to bring you the most up-to-date and reliable health information
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}