import React from 'react';
import { MessageSquare, Send, Search, Filter } from 'lucide-react';

const Messages = () => {
  const conversations = [
    {
      id: 1,
      name: 'John Smith',
      lastMessage: 'Thanks for the quick response!',
      timestamp: '2 min ago',
      unread: 2,
      avatar: 'JS',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      lastMessage: 'I can offer 7.5% interest rate',
      timestamp: '1 hour ago',
      unread: 0,
      avatar: 'SJ',
    },
    {
      id: 3,
      name: 'Mike Wilson',
      lastMessage: 'When can we schedule a call?',
      timestamp: '3 hours ago',
      unread: 1,
      avatar: 'MW',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Connect with borrowers and lenders</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
                <span className="badge badge-info">3</span>
              </div>
              <div className="mt-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search conversations..."
                />
              </div>
            </div>
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {conversation.avatar}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="badge badge-primary">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="card h-96 flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">JS</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">John Smith</h4>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-900">
                      Hi! I'm interested in your business expansion loan. Can you tell me more about your business?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-blue-600 rounded-lg px-4 py-2">
                    <p className="text-sm text-white">
                      Sure! I run a small restaurant and want to open a second location. I have a solid business plan and good credit history.
                    </p>
                    <p className="text-xs text-blue-100 mt-1">10:32 AM</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-900">
                      That sounds great! What's your current revenue and how long have you been in business?
                    </p>
                    <p className="text-xs text-gray-500 mt-1">10:35 AM</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-xs lg:max-w-md">
                  <div className="bg-blue-600 rounded-lg px-4 py-2">
                    <p className="text-sm text-white">
                      We've been operating for 3 years with $50K monthly revenue. I can share our financial statements if you're interested.
                    </p>
                    <p className="text-xs text-blue-100 mt-1">10:37 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  className="flex-1 input"
                  placeholder="Type your message..."
                />
                <button className="btn btn-primary flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
