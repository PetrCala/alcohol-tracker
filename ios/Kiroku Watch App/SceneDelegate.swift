//
//  SceneDelegate.swift
//  Kiroku Watch App
//
//  Created by JF41513 on 30.06.2024.
//

import WatchKit

class SceneDelegate: NSObject, WKSceneDelegate {
    
    func scene(_ scene: WKScene, willConnectTo session: WKApplicationSession, options connectionOptions: [WKScene.ConnectionOptions]) {
        // Called when the scene is being created and connected to the session
        // Use this method to optionally configure and attach the interface controller to the provided WKScene `scene`.
    }
    
    func sceneDidDisconnect(_ scene: WKScene) {
        // Called as the scene is being released by the system.
        // This occurs shortly after the scene enters the background, or when its session is discarded.
    }

    func sceneDidBecomeActive(_ scene: WKScene) {
        // Called when the scene has moved from an inactive state to an active state.
        // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
    }

    func sceneWillResignActive(_ scene: WKScene) {
        // Called when the scene will move from an active state to an inactive state.
        // This may occur due to temporary interruptions (ex. an incoming phone call).
    }
    
    func sceneWillEnterForeground(_ scene: WKScene) {
        // Called as the scene transitions from the background to the foreground.
        // Use this method to undo the changes made on entering the background.
    }

    func sceneDidEnterBackground(_ scene: WKScene) {
        // Called as the scene transitions from the foreground to the background.
        // Use this method to save data, release shared resources, and store enough scene-specific state information
        // to restore the scene back to its current state.
    }

}