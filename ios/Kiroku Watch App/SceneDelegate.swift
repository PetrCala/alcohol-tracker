//
//  SceneDelegate.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 30.06.2024.
//

import WatchKit

class SceneDelegate: NSObject, WKApplicationDelegate {
    
    func applicationDidFinishLaunching() {
        // Perform any final initialization of your application.
    }
    
    func applicationDidBecomeActive() {
        // Restart any tasks that were paused (or not yet started) while the application was inactive.
    }

    func applicationWillResignActive() {
        // Sent when the application is about to move from active to inactive state. 
        // This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) 
        // or when the user quits the application and it begins the transition to the background state.
    }

    func applicationDidEnterBackground() {
        // Use this method to release shared resources, save user data, invalidate timers, 
        // and store enough application state information to restore your application to its current state in case it is terminated later.
    }
    
    func applicationWillEnterForeground() {
        // Called as part of the transition from the background to the foreground; 
        // here you can undo many of the changes made on entering the background.
    }
    
    func applicationWillTerminate() {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

}

