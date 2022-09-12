#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuEntry, MenuEvent, MenuItem, Submenu};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn create_menu() -> Menu {
    let mut menu = Menu::os_default("tiny-md-editor");
    // ensure file menu
    let file_menu_index = if let Some(i) = menu.items.iter().position(|item| {
        if let MenuEntry::Submenu(submenu) = item {
            submenu.title == "File"
        } else {
            false
        }
    }) {
        i
    } else {
        menu = menu.add_submenu(Submenu::new("File", Menu::new()));
        menu.items.len() - 1
    };
    if let MenuEntry::Submenu(file_menu) = &mut menu.items[file_menu_index] {
        let mut menu = Menu::new()
            .add_item(CustomMenuItem::new("open", "Open"))
            .add_item(CustomMenuItem::new("save", "Save").accelerator("Cmd + S"));
        menu.items.append(&mut file_menu.clone().inner.items);
        file_menu.inner = menu;
    }
    menu
}

fn main() {
    tauri::Builder::default()
        .menu(create_menu())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
