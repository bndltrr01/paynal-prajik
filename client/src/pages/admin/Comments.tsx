import { faFilter, faSearch, faSort, faStar, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface Review {
  id: number;
  user: string;
  avatar?: string;
  rating: number;
  date: string;
  comment?: string;
  room?: string;
}

const Comments = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'highest'>('all');
  const [search, setSearch] = useState<string>('');

  // Sample data; replace with your actual data.
  const reviewsData: Review[] = [
    {
      id: 1,
      user: 'Alex Johnson',
      rating: 5,
      date: '2025-03-10',
      comment:
        'Amazing room with a beautiful view! The staff was incredibly helpful and the amenities exceeded my expectations. Will definitely be back soon.',
      room: 'Deluxe Ocean Suite'
    },
    {
      id: 2,
      user: 'Maria Garcia',
      rating: 4,
      date: '2025-03-12',
      comment:
        'Very comfortable stay. The spa area was fantastic and the room was clean and spacious. Only small issue was the WiFi connection was spotty at times.',
      room: 'Garden View Room'
    },
    {
      id: 3,
      user: 'James Wilson',
      rating: 3,
      date: '2025-03-14',
      comment:
        'Good location and decent amenities. The room was smaller than expected but still comfortable. Breakfast options could be improved.',
      room: 'Standard Twin Room'
    },
    {
      id: 4,
      user: 'Emily Chen',
      rating: 5,
      date: '2025-03-15',
      comment:
        'Perfect getaway! The mountain view was breathtaking and the room service was prompt. The heated pool was a wonderful bonus during our stay.',
      room: 'Mountain View Suite'
    },
    {
      id: 5,
      user: 'David Brown',
      rating: 2,
      date: '2025-03-08',
      comment:
        'Disappointed with the cleanliness of the room. The location is convenient but there were several maintenance issues that should have been addressed.',
      room: 'Economy Room'
    }
  ];

  // Filter and sort the reviews.
  const filteredReviews = reviewsData
    .filter(review =>
      review.user.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase()) ||
      (review.room && review.room.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (activeTab === 'recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (activeTab === 'highest') {
        return b.rating - a.rating;
      }
      return 0;
    });

  // Render stars for rating.
  const renderStars = (rating: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          icon={faStar}
          key={i}
          className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} w-4 h-4`}
        />
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-25px)] p-3 overflow-y-auto container mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Guest Reviews</h1>
      <p className="text-gray-900 mt-1">
        See what our guests are saying about their hotel experience
      </p>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 md:gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
              <FontAwesomeIcon icon={faFilter} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
              <FontAwesomeIcon icon={faSort} /> Sort
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4 border-t pt-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('all')}
          >
            All Reviews
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'recent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('recent')}
          >
            Most Recent
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'highest'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('highest')}
          >
            Highest Rated
          </button>
        </div>
      </div>

      {/* Comments Container – limited to first 4 comments with truncated text */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.slice(0, 4).length > 0 ? (
            filteredReviews.slice(0, 4).map((review) => {
              const truncatedComment =
                review.comment && review.comment.length > 160
                  ? review.comment.substring(0, 160) + "..."
                  : review.comment;
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        {review.avatar ? (
                          <img
                            src={review.avatar}
                            alt={review.user}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{review.user}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>{renderStars(review.rating)}</div>
                  </div>
                  <div className="mt-3">
                    {review.room && (
                      <div className="mb-2">
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 py-1 px-2 rounded">
                          {review.room}
                        </span>
                      </div>
                    )}
                    <p className="text-gray-600">{truncatedComment}</p>
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button className="text-sm text-gray-500 hover:text-blue-600">
                        Reply
                      </button>
                      <button className="text-sm text-gray-500 hover:text-blue-600">
                        Report
                      </button>
                    </div>
                    <div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-500">
                No reviews found matching your search criteria.
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredReviews.slice(0, 4).length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white">1</button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                3
              </button>
              <span className="px-3 py-1 text-gray-500">...</span>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
