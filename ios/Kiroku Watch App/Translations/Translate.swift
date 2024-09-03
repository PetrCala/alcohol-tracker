//
//  Translate.swift
//  Kiroku Watch App
//
//  Created by PetrCala on 07.07.2024.
//

import Foundation

enum Language: String {
    case english = "en"
    case czech = "cs"
    // Add other languages here
}

class Translate {
    static func getText(for key: String, arguments: [String] = []) -> String {
      let languageCode = Locale.current.language.languageCode?.identifier ?? "en"
        let translations: [String: String]
        
        switch Language(rawValue: languageCode) {
        case .czech:
            translations = CzechTexts.translations
        case .english:
            fallthrough
        default:
            translations = EnglishTexts.translations
        }
        
        guard var text = translations[key] else {
            return ""
        }
        
        for (index, argument) in arguments.enumerated() {
            text = text.replacingOccurrences(of: "{\(index)}", with: argument)
        }
        
        return text
    }
}
