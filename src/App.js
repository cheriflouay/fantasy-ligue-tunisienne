// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PickTeam from './pages/PickTeam'; // Will be for initial pick only
import MyTeam from './pages/MyTeam'; // NEW: For managing existing team
import Transfers from './pages/Transfers';
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';
import PlayerDetails from './pages/PlayerDetails';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GlobalStyle from './styles/GlobalStyle';

// Import Firebase modules
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Import your JSON data
import mockPlayersData from './data/players.json';
import mockTeamsData from './data/clubs.json';
import mockFixturesData from './data/fixtures.json';

function App() {
    const [activePage, setActivePage] = useState('login');
    const [userData, setUserData] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [allFixtures, setAllFixtures] = useState([]);
    const [userOverallPoints, setUserOverallPoints] = useState(0);
    const [userRank, setUserRank] = useState(0);
    const [isInitialTeamSaved, setIsInitialTeamSaved] = useState(false); // Changed to boolean

    // Firebase states
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const localAppId = 'fantasy-ligue-tunisienne-local';
    const localFirebaseConfig = useMemo(() => ({
        apiKey: "AIzaSyA1-ZN4ltO9Clx36V1A6DqiGAVRamt2RNA",
        authDomain: "fantasy-ligue-tunisienne-42148.firebaseapp.com",
        projectId: "fantasy-ligue-tunisienne-42148",
        storageBucket: "fantasy-ligue-tunisienne-42148.firebaseapp.com",
        messagingSenderId: "434834511318",
        appId: "1:434834511318:web:5827cad8c8d0fe48044077",
        measurementId: "G-4K0QS7092Y"
    }), []);

    const currentAppId = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : localAppId;
    const currentFirebaseConfig = typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : localFirebaseConfig;


    // Function to fetch user data from Firestore
    const fetchUserData = useCallback(async (uid, dbInstance) => {
        if (!dbInstance || !uid) return;

        const userDocRef = doc(dbInstance, `artifacts/${currentAppId}/users/${uid}/profile/data`);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const fetchedData = docSnap.data();
                setUserData(fetchedData);

                // Check if players array exists and has 15 entries (now objects with onPitch)
                const hasSavedTeam = fetchedData.players && fetchedData.players.length === 15 &&
                                     fetchedData.players.every(p => typeof p.onPitch === 'boolean');
                setIsInitialTeamSaved(hasSavedTeam);

                // Navigate based on whether an initial team is saved
                if (hasSavedTeam) {
                    setActivePage('dashboard');
                } else {
                    setActivePage('pickTeamInitial'); // New page for initial pick
                }
                setUserOverallPoints(fetchedData.totalOverallPoints || 0);
                setUserRank(fetchedData.overallRank || 'N/A');

            } else {
                // Document does not exist, create initial user data
                const initialData = {
                    teamName: "My Team",
                    budget: 100.0,
                    players: [], // Initially empty, will be filled with {id, onPitch} objects
                    captainId: null,
                    viceCaptainId: null,
                    gameweekPoints: 0,
                    totalOverallPoints: 0,
                    overallRank: 'N/A'
                };
                setDoc(userDocRef, initialData)
                    .then(() => {
                        setUserData(initialData);
                        setIsInitialTeamSaved(false);
                        setActivePage('pickTeamInitial'); // Direct new users to initial pick
                    })
                    .catch(error => console.error("Error creating initial user data:", error));
            }
        }, (error) => {
            console.error("Error listening to user data:", error);
            setUserData(null);
        });

        return unsubscribe;
    }, [currentAppId, setActivePage]);


    // Firebase Initialization
    useEffect(() => {
        if (typeof window === 'undefined') {
            console.warn("Skipping Firebase initialization: Not in a browser environment.");
            setLoadingAuth(false);
            return;
        }

        try {
            const app = initializeApp(currentFirebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    if (user.isAnonymous) {
                        console.log("Anonymous user detected. Signing out to force explicit login.");
                        await signOut(authInstance);
                        setCurrentUser(null);
                        setUserData(null);
                        setActivePage('login');
                    } else {
                        setCurrentUser(user);
                        await fetchUserData(user.uid, dbInstance);
                    }
                } else {
                    setCurrentUser(null);
                    setUserData(null);
                    setActivePage('login');
                }
                setAuthReady(true);
                setLoadingAuth(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setLoadingAuth(false);
        }
    }, [currentFirebaseConfig, fetchUserData]);


    // Load static data
    useEffect(() => {
        setAllPlayers(mockPlayersData);
        setAllTeams(mockTeamsData);
        setAllFixtures(mockFixturesData);
    }, []);

    // Custom setUserData that also updates Firestore
    // This function now expects newData.players to be an array of {id, onPitch} objects
    const updateUserDataInFirestore = useCallback(async (newData) => {
        setUserData(newData); // Optimistically update local state

        if (!db || !currentUser) {
            console.warn("Firestore or current user not available to save data.");
            return;
        }
        const userDocRef = doc(db, `artifacts/${currentAppId}/users/${currentUser.uid}/profile/data`);
        try {
            // Ensure newData.players is an array of objects before saving
            const playersToSave = newData.players.map(p => ({ id: p.id, onPitch: p.onPitch }));
            await setDoc(userDocRef, { ...newData, players: playersToSave }, { merge: true });
        } catch (error) {
            if (error.message && error.message.includes("Function setDoc() called with invalid data. Data must be an object, but it was: a function")) {
                console.warn("Firebase setDoc received unexpected function, but operation appears successful. Suppressing this specific error log.");
            } else {
                console.error("Error saving user data to Firestore:", error);
                alert("Failed to save changes to the cloud. Please try again.");
            }
        }
    }, [db, currentUser, currentAppId]);


    // Firebase Auth functions
    const handleSignUp = useCallback(async (email, password, teamName) => {
        if (!auth) return { success: false, message: "Authentication service not ready." };
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Sign up error:", error);
            return { success: false, message: error.message };
        }
    }, [auth]);

    const handleLogin = useCallback(async (email, password) => {
        if (!auth) return { success: false, message: "Authentication service not ready." };
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, message: error.message };
        }
    }, [auth]);

    const handleGoogleLogin = useCallback(async () => {
        if (!auth) return { success: false, message: "Authentication service not ready." };
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            return { success: true };
        } catch (error) {
            console.error("Google login error:", error);
            let errorMessage = "Google login failed.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Google login cancelled.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = "Login already in progress. Please try again.";
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = "An account with this email already exists. Try logging in with email/password.";
            }
            return { success: false, message: errorMessage };
        }
    }, [auth]);


    const handleLogout = useCallback(async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            setActivePage('login');
        }
        catch (error) {
            console.error("Logout error:", error);
        }
    }, [auth]);

    // Function to handle the initial team save from PickTeam.js
    // Expects squadPlayers to be an array of player objects with 'id' and 'onPitch'
    const handleInitialTeamSave = useCallback(async (squadPlayers, finalBudget) => {
        if (!currentUser || !db) {
            console.error("User not authenticated or database not ready to save team.");
            return;
        }
        const userDocRef = doc(db, `artifacts/${currentAppId}/users/${currentUser.uid}/profile/data`);
        try {
            // Map players to only save id and onPitch status
            const playersToSave = squadPlayers.map(p => ({ id: p.id, onPitch: p.onPitch }));

            await setDoc(userDocRef, {
                players: playersToSave,
                budget: parseFloat(finalBudget),
                // Initial team pick does not set captain/vice-captain yet
                captainId: null,
                viceCaptainId: null,
            }, { merge: true });
            setIsInitialTeamSaved(true);
            setActivePage('dashboard'); // Navigate to dashboard after initial save
        } catch (error) {
            console.error("Error saving initial team:", error);
            alert("Failed to save team. Please try again.");
        }
    }, [currentUser, db, currentAppId, setActivePage]);


    const renderPage = () => {
        if (loadingAuth || !authReady || !db || allPlayers.length === 0 || allTeams.length === 0 || allFixtures.length === 0) {
            return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5em', color: 'white' }}>Loading application...</div>;
        }

        if (!currentUser) {
            switch (activePage) {
                case 'signup':
                    return <SignUp onSignUp={handleSignUp} setActivePage={setActivePage} />;
                default:
                    return <Login onLogin={handleLogin} setActivePage={setActivePage} onGoogleLogin={handleGoogleLogin} />;
            }
        }

        if (!userData) {
            return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.5em', color: 'white' }}>Loading user data...</div>;
        }

        // If initial team is not saved, force user to PickTeam
        if (!isInitialTeamSaved) {
            return (
                <PickTeam
                    userData={userData}
                    allPlayers={allPlayers}
                    allTeams={allTeams}
                    allFixtures={allFixtures}
                    setUserData={updateUserDataInFirestore} // This is the general update function
                    onInitialSave={handleInitialTeamSave} // Specific for initial save
                    currentUser={currentUser}
                />
            );
        }

        // If initial team is saved, allow navigation to other pages
        switch (activePage) {
            case 'dashboard':
                return <Dashboard userData={userData} />;
            case 'myTeam':
                return (
                    <MyTeam // Render MyTeam component
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        setUserData={updateUserDataInFirestore}
                        currentUser={currentUser}
                    />
                );
            case 'transfers':
                return (
                    <Transfers
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        setUserData={updateUserDataInFirestore}
                        currentUser={currentUser}
                    />
                );
            case 'fixtures':
                return <Fixtures allTeams={allTeams} allFixtures={allFixtures} />;
            case 'standings':
                return <Standings allTeams={allTeams} />;
            case 'playerDetails':
                return <PlayerDetails />;
            default:
                return <Dashboard userData={userData} />;
        }
    };

    return (
        <>
            <GlobalStyle />
            {currentUser && (
                <>
                    <Header userRank={userRank} userOverallPoints={userOverallPoints} onLogout={handleLogout} />
                    <Navigation
                        setActivePage={setActivePage}
                        activePage={activePage}
                        isInitialTeamSaved={isInitialTeamSaved}
                        onLogout={handleLogout} // Pass onLogout to Navigation
                    />
                </>
            )}
            <main>
                {renderPage()}
            </main>
        </>
    );
}

export default App;
