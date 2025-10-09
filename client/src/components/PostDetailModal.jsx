import React from "react";
import { MessageCircle, ExternalLink, ThumbsUp, Calendar, User, Hash, Heart, Repeat2 } from "lucide-react";

const PostDetailModal = ({ isOpen, onClose, post, activeTab }) => {
    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden l flex flex-col">
                {/* Modal Header - Fixed */}
                <div className="p-8 md:p-12 pb-6 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                {activeTab === 'reddit' ? <MessageCircle className="h-6 w-6 text-white" /> : <Hash className="h-6 w-6 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {activeTab === 'reddit' ? 'Reddit Post Details' : 'Twitter Post Details'}
                                </h2>
                               
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                        >
                            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="px-8 md:px-12 pb-8 overflow-y-auto flex-1">
                    <div className="space-y-8">
                        {/* Title/Text */}
                        <div>
                            {activeTab === 'reddit' ? (
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">
                                        {post.postTitle || post.title}
                                    </a>
                                </h3>
                            ) : (
                                <div className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                                    {post.text}
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeTab === 'reddit' ? (
                                <>
                                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-xl">
                                        <User className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Author</p>
                                            <p className="font-semibold text-gray-900">{post.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 rounded-xl">
                                        <MessageCircle className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Subreddit</p>
                                            <p className="font-semibold text-orange-700">r/{post.subreddit}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-blue-50 px-4 py-3 rounded-xl">
                                        <ThumbsUp className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Upvotes</p>
                                            <p className="font-semibold text-blue-700">{post.upvotes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-xl">
                                        <MessageCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Comments</p>
                                            <p className="font-semibold text-green-700">{post.commentCount}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-xl">
                                        <User className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Author</p>
                                            <p className="font-semibold text-gray-900">{post.authorId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-blue-50 px-4 py-3 rounded-xl">
                                        <Hash className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Search Hashtag</p>
                                            <p className="font-semibold text-blue-700">#{post.searchHashtag}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-red-50 px-4 py-3 rounded-xl">
                                        <Heart className="h-5 w-5 text-red-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Likes</p>
                                            <p className="font-semibold text-red-700">{post.likes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-xl">
                                        <Repeat2 className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Retweets</p>
                                            <p className="font-semibold text-green-700">{post.retweets}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                            {(post.fetchedAt || post.createdAt) && (
                                <div className="flex items-center space-x-3 bg-purple-50 px-4 py-3 rounded-xl">
                                    <Calendar className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Date</p>
                                        <p className="font-semibold text-purple-700">
                                            {new Date(post.fetchedAt || post.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Body */}
                        {activeTab === 'reddit' && (post.selftext || post.description) && (
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Post Content</h4>
                                <p className="text-gray-700 leading-relaxed text-base">
                                    {post.selftext || post.description}
                                </p>
                            </div>
                        )}

                        {/* Hashtags for Twitter */}
                        {activeTab === 'twitter' && post.hashtags && post.hashtags.length > 0 && (
                            <div className="bg-blue-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Hashtags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {post.hashtags.map((hashtag, idx) => (
                                        <span key={idx} className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-full font-medium">
                                            #{hashtag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments for Reddit */}
                        {activeTab === 'reddit' && post.comments && post.comments.length > 0 && (
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments ({post.comments.length})</h4>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {post.comments.map((comment, commentIndex) => (
                                        <div key={commentIndex} className="bg-white rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <User className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm font-semibold text-gray-700">{comment.author || 'anonymous'}</span>
                                                <span className="text-gray-300">•</span>
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-500">
                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown date'}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 leading-relaxed">
                                                {comment.text || 'No comment text available'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External Link */}
                        <div className="flex justify-center pt-4">
                            <a
                                href={activeTab === 'reddit' ? post.permalink : post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center cursor-pointer space-x-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform "
                            >
                                <ExternalLink className="h-5 w-5" />
                                <span className="font-semibold">
                                    {activeTab === 'reddit' ? 'View on Reddit' : 'View on Twitter'}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;