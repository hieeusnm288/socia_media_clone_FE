import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const Posts = ({ feedType }) => {
  const { username } = useParams();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`${backendUrl}/users/profile/${username}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message || "Something went wrong");
      }
    },
    enabled: !!username,
  });

  // const isLoading = false;
  // const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const getPostEndPoin = () => {
    switch (feedType) {
      case "forYou":
        return "/posts/all";
      case "following":
        return "/posts/flowing";
      case "posts":
        return `/posts/user/${username}`;
      case "likes":
        return `/posts/likePost/${userProfile?._id}`;
      default:
        return "/posts/all";
    }
  };

  const POST_ENDPOINT = getPostEndPoin();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(`${backendUrl}${POST_ENDPOINT}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
