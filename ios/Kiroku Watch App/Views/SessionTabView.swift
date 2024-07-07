//
//  SessionTabView.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 07.07.2024.
//

import Foundation
import SwiftUI

struct SessionTabView: View {
    @ObservedObject var viewModel: SessionViewModel
    
    var body: some View {
        TabView {
            SessionControlView(viewModel: viewModel)
                .tabItem {
                    Text("Control")
                }
            MainScreenView(viewModel: viewModel)
                .tabItem {
                    Text("Main")
                }
        }
        .tabViewStyle(PageTabViewStyle())
        .navigationBarBackButtonHidden(true)
    }
}

struct SessionTabView_Previews: PreviewProvider {
    static var previews: some View {
        SessionTabView(viewModel: SessionViewModel())
    }
}

