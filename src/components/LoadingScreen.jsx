import React from 'react';

const LoadingScreen = ({ message = "Загрузка..." }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/90 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center">
                    {/* Upload icon with animation */}
                    <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                        <div className="absolute inset-2 flex items-center justify-center">
                            <svg 
                                className="w-8 h-8 text-blue-500 animate-pulse" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                                />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Progress text */}
                    <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
                    <p className="text-gray-400 text-center">
                        Пожалуйста, подождите...
                    </p>
                    
                    {/* Progress dots animation */}
                    <div className="flex space-x-2 mt-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen; 