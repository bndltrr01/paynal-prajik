/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { lazy } from "react";
import { Link, useParams } from "react-router-dom";
import ReviewList from "../components/reviews/ReviewList";
import { fetchAreaDetail, fetchAreas } from "../services/Area";
import { fetchAreaReviews } from "../services/Booking";

const LoadingDashboard = lazy(() => import("../motions/skeletons/AdminDashboardSkeleton"));
const Error = lazy(() => import("./_ErrorBoundary"));

interface Area {
    id: number;
    area_name: string;
    description: string;
    area_image: string;
    status: string;
    capacity: number;
    price_per_hour: string;
}

const VenueDetails = () => {
    const { id } = useParams<{ id: string }>();

    const {
        data: venueData,
        isLoading: isLoadingVenue,
        error: venueError,
    } = useQuery<{ data: Area }>({
        queryKey: ["venue", id],
        queryFn: () => fetchAreaDetail(Number(id)),
        enabled: !!id,
    });

    const { data: allVenuesData } = useQuery<{ data: Area[] }>({
        queryKey: ["venues"],
        queryFn: fetchAreas,
    });

    const {
        data: reviewsData,
        isLoading: isLoadingReviews,
        error: reviewsError
    } = useQuery({
        queryKey: ["areaReviews", id],
        queryFn: () => fetchAreaReviews(id as string),
        enabled: !!id,
    });

    if (isLoadingVenue) return <LoadingDashboard />;
    if (venueError) return <Error />;

    const venueDetail = venueData?.data;
    if (!venueDetail) {
        return <div className="text-center mt-4">No venue details available</div>;
    }

    const allVenues = allVenuesData?.data || [];
    const currentIndex = allVenues.findIndex((venue: any) => venue.id === Number(id));
    const prevVenue = currentIndex > 0 ? allVenues[currentIndex - 1] : null;
    const nextVenue = currentIndex < allVenues.length - 1 ? allVenues[currentIndex + 1] : null;

    const reviews = reviewsData?.data || [];

    // Format price if needed - remove ₱ if it already exists in the string
    const formattedPrice = typeof venueDetail.price_per_hour === 'string'
        ? venueDetail.price_per_hour.startsWith('₱')
            ? venueDetail.price_per_hour
            : `${venueDetail.price_per_hour}`
        : `${venueDetail.price_per_hour}`;

    return (
        <div className="container mx-auto py-10 px-4">
            <section className="container mx-auto min-h-screen mt-[100px] overflow-x-hidden">
                {/* Hero Banner */}
                <div
                    className="h-[400px] w-full overflow-hidden bg-cover bg-center relative before:absolute before:inset-0 before:bg-black/60 before:z-0 text-white"
                    style={{ backgroundImage: `url(${venueDetail.area_image})` }}
                >
                    <div className="absolute top-5 left-5 flex items-center gap-x-3 z-11 cursor-pointer">
                        <Link
                            to="/venues"
                            className="flex items-center gap-x-3 text-white hover:text-white/80"
                        >
                            <i className="fa fa-arrow-left text-xl"></i>
                            <span className="text-xl">Back to Areas</span>
                        </Link>
                    </div>
                    <div className="relative z-10 flex h-full items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-montserrat font-bold tracking-wider uppercase">
                                {venueDetail.area_name}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Venue Details Section */}
                <div className="py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Venue Image */}
                        <div className="w-full space-y-8">
                            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                                <img
                                    loading="lazy"
                                    src={venueDetail.area_image}
                                    alt={venueDetail.area_name}
                                    className="w-full h-auto object-cover"
                                />
                            </div>

                            {/* Prev/Next Venue Navigation */}
                            <div className="flex justify-between mt-6">
                                {prevVenue ? (
                                    <Link
                                        to={`/venues/${prevVenue.id}`}
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        <i className="fa fa-chevron-left"></i>
                                        <span>Previous Area</span>
                                    </Link>
                                ) : (
                                    <div></div>
                                )}

                                {nextVenue ? (
                                    <Link
                                        to={`/venues/${nextVenue.id}`}
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        <span>Next Area</span>
                                        <i className="fa fa-chevron-right"></i>
                                    </Link>
                                ) : (
                                    <div></div>
                                )}
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
                                <h2 className="text-3xl font-playfair font-semibold mb-4">
                                    Guest Reviews
                                </h2>
                                <hr className="border-gray-300 mb-6" />

                                <ReviewList
                                    reviews={reviews}
                                    isLoading={isLoadingReviews}
                                    error={reviewsError as Error | null}
                                />
                            </div>
                        </div>

                        {/* Right Column - Venue Details */}
                        <div className="flex flex-col space-y-8">
                            {/* Venue Description */}
                            <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
                                <h2 className="font-playfair text-3xl font-semibold mb-4">
                                    Area Description
                                </h2>
                                <hr className="border-gray-300 mb-4" />
                                <p className="text-lg font-playfair">
                                    {venueDetail.description || "No description available."}
                                </p>
                            </div>

                            {/* Venue Details */}
                            <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-sm">
                                <h2 className="text-3xl font-playfair font-semibold mb-4">
                                    Area Information
                                </h2>
                                <hr className="border-gray-300 mb-4" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-900">Capacity</h3>
                                        <p className="text-lg">{venueDetail.capacity} people</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-900">Price</h3>
                                        <p className="text-lg">{formattedPrice}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reserve Now Button */}

                            <Link to={`/venue-booking/${venueDetail.id}`}>
                                <button className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                    Reserve Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default VenueDetails;