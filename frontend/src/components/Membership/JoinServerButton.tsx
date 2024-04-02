import { useParams } from "react-router-dom";
import { useMembershipContext } from "../../context/MembershipContext";

const JoinServerButton = () => {
  const { serverId } = useParams();
  const { joinServer, leaveServer, error, isLoading, isMember, isUserMember } =
    useMembershipContext();

  const handleJoinServer = async () => {
    try {
      await joinServer(Number(serverId));
      console.log("user has Joined the server");
    } catch (error) {
      console.log("Error Joining", error);
    }
  };

  const handleLeaveServer = async () => {
    try {
      await leaveServer(Number(serverId));
      console.log("user has left the server");
    } catch (error) {
      console.log("Error leaving server:");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // if (error) {
  //   return <div>Error: {error.message}</div>;
  // }

  return (
    <>
      isMember: {isUserMember.toString()}
      {isUserMember ? (
        <button onClick={handleLeaveServer}>Leave Server</button>
      ) : (
        <button onClick={handleJoinServer}>Join Server</button>
      )}
    </>
  );
};

export default JoinServerButton;
