const API = "https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod";

export function fetchUserAnalytics(platform, opponent, opponentColour, gameType, accessToken) {
  const options = {};
  if (accessToken) {
    options.headers = { Authorization: `Bearer ${accessToken}` };
  }

  return fetch(
    `${API}/user-analytics?platform=${platform}&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`,
    options,
  ).then(toJsonOrReject);
}

export function fetchOpponentNotes(user, opponent) {
  return fetch(`${API}/opponent-notes?username=${user}&opponentName=${opponent}`).then(toJsonOrReject);
}

export function saveOpponentNotes(user, opponent, notes) {
  return fetch(`${API}/opponent-notes`, {
    method: "POST",
    body: JSON.stringify({
      username: user,
      opponentName: opponent,
      notes,
    }),
  }).then(okOrReject);
}

function okOrReject(response) {
  return response.ok ? Promise.resolve(response) : Promise.reject(response);
}

function toJsonOrReject(response) {
  return response.ok ? response.json() : Promise.reject(response);
}
