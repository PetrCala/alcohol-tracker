import SwiftUI

struct InitialView: View {
    @StateObject private var viewModel = SessionViewModel()
    @State private var navigateToMainScreen = false
    
    var body: some View {
        NavigationStack {
            VStack {
                StartSessionContent(viewModel: viewModel, navigateToMainScreen: $navigateToMainScreen)
            }
            // .navigationTitle("Home")
            .navigationDestination(isPresented: $navigateToMainScreen) {
                SessionTabView(viewModel: viewModel, initialTab: 1)
            }
        }
    }
}

struct InitialView_Previews: PreviewProvider {
    static var previews: some View {
        InitialView()
    }
}
