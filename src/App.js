// src/App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PickTeam from './pages/PickTeam';
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
    const [isInitialTeamSaved, setIsInitialTeamSaved] = useState(false);

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
        storageBucket: "fantasy-ligue-tunisienne-42148.firebasestorage.app",
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

                const hasSavedTeam = fetchedData.players && fetchedData.players.length === 15;
                setIsInitialTeamSaved(hasSavedTeam);

                if (hasSavedTeam) {
                    setActivePage('dashboard');
                } else {
                    setActivePage('pickTeamInitial');
                }
                setUserOverallPoints(fetchedData.totalOverallPoints || 0);
                setUserRank(fetchedData.overallRank || 'N/A');

            } else {
                // Document does not exist, create initial user data
                const initialData = {
                    teamName: "My Team",
                    budget: 100.0,
                    players: [], // Initially empty
                    captainId: null, // NEW: Initialize captainId
                    viceCaptainId: null, // NEW: Initialize viceCaptainId
                    gameweekPoints: 0,
                    totalOverallPoints: 0,
                    overallRank: 'N/A'
                };
                setDoc(userDocRef, initialData)
                    .then(() => {
                        setUserData(initialData);
                        setIsInitialTeamSaved(false);
                        setActivePage('pickTeamInitial');
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
    const updateUserDataInFirestore = useCallback(async (newData) => {
        if (!db || !currentUser) {
            console.warn("Firestore or current user not available to save data.");
            return;
        }
        const userDocRef = doc(db, `artifacts/${currentAppId}/users/${currentUser.uid}/profile/data`);
        try {
            await setDoc(userDocRef, newData, { merge: true });
        } catch (error) {
            console.error("Error saving user data to Firestore:", error);
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

    // Function to handle the initial team save
    const handleInitialTeamSave = useCallback(async (squadPlayers, finalBudget) => {
        if (!currentUser || !db) {
            console.error("User not authenticated or database not ready to save team.");
            return;
        }
        const userDocRef = doc(db, `artifacts/${currentAppId}/users/${currentUser.uid}/profile/data`);
        try {
            await setDoc(userDocRef, {
                players: squadPlayers.map(p => p.id),
                budget: parseFloat(finalBudget),
                // Captain and Vice-Captain are NOT saved during initial team pick
                // They will be saved with 'Save Lineup Changes'
            }, { merge: true });
            setIsInitialTeamSaved(true);
            setActivePage('dashboard');
        } catch (error) {
            console.error("Error saving initial team:", error);
            alert("Failed to save team. Please try again.");
        }
    }, [currentUser, db, currentAppId]);


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

        if (!isInitialTeamSaved) {
            return (
                <PickTeam
                    userData={userData}
                    allPlayers={allPlayers}
                    allTeams={allTeams}
                    allFixtures={allFixtures}
                    setUserData={updateUserDataInFirestore}
                    isInitialPick={true}
                    onInitialSave={handleInitialTeamSave}
                    currentUser={currentUser}
                />
            );
        }

        switch (activePage) {
            case 'dashboard':
                return <Dashboard userData={userData} />;
            case 'myTeam':
                return (
                    <PickTeam
                        userData={userData}
                        allPlayers={allPlayers}
                        allTeams={allTeams}
                        allFixtures={allFixtures}
                        setUserData={updateUserDataInFirestore}
                        isInitialPick={false}
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
