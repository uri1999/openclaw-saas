import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase-config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loginWithGoogle() {
        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google Sign In Error:", error);
            throw error;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        const refCode = localStorage.getItem('inshort_ref');
                        const userData = {
                            email: user.email,
                            displayName: user.displayName,
                            createdAt: new Date(),
                        };
                        if (refCode) {
                            userData.referredBy = refCode;
                        }
                        await setDoc(userRef, userData);
                    }
                } catch (e) {
                    console.error("Firestore user sync error:", e);
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
