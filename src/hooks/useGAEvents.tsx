import ReactGA from "react-ga";
const useGAEventTrackers = (category = "Unnamed Category") => {
  const eventStacker = (action = "Unnamed Action", label = "Unnamed Label") => {
    ReactGA.event({ category, action, label });
  };
  return eventStacker;
};
export default useGAEventTrackers;
