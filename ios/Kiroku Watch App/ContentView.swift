//
//  ContentView.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 29.06.2024.
//

import SwiftUI
import Foundation

struct ContentView: View {
    var body: some View {
        ZStack {
            AppColors.backgroundColor
                .edgesIgnoringSafeArea(.all) // This ensures the color covers the entire screen
            
            // MainScreenView()
            StartSessionView()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}