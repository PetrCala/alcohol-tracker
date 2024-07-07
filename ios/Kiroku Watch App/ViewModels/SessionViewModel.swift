//
//  SessionViewModel.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 07.07.2024.
//

import Combine
import Foundation

class SessionViewModel: ObservableObject {
    @Published var session = SessionModel.shared
    
    func startSession() {
        session.startSession()
        // Trigger other functionality like communication with database here
        // For example: DatabaseManager.shared.startSession()
    }
    
    func endSession() {
        session.endSession()
    }
    
    func addUnit() {
        session.addUnit()
    }
    
    func subtractUnit() {
        session.subtractUnit()
    }
}
