#!/usr/bin/env python
# -*- coding: utf-8 -*-
import time
import threading
import traceback
import win32gui
import win32con
from pywinauto import Application, Desktop


window_title = '密码输入对话框'
button_title = '确定'
sign_pwd = '12345678'
edit_index = 1


def is_open_window():
    windows = Desktop().windows()
    return any(window.window_text() == window_title for window in windows)


def is_exist_window():
    hwnd = win32gui.FindWindow(None, window_title)
    return hwnd != 0


def deal_sign_window():
    while True:
        if is_open_window():
            try:
                window = Application().connect(title=window_title).window(title=window_title)
                window.child_window(class_name='Edit', top_level_only=False, found_index=edit_index).type_keys(sign_pwd)
                time.sleep(0.5)
                window.child_window(title=button_title).click()
                time.sleep(1)
                if is_open_window():
                    time.sleep(1)
                    if is_exist_window():
                        hwnd = win32gui.FindWindow(None, window_title)
                        win32gui.SetForegroundWindow(hwnd)
                        edit_window = []

                        def enum_child_windows_callback(child_hwnd, lParam):
                            child_class_name = win32gui.GetClassName(child_hwnd)
                            if child_class_name == 'Edit':
                                edit_window.append(child_hwnd)
                            return True

                        win32gui.EnumChildWindows(hwnd, enum_child_windows_callback, 0)
                        win32gui.SendMessage(edit_window[edit_index], win32con.WM_SETTEXT, 0, sign_pwd)
                        button_hwnd = win32gui.FindWindowEx(hwnd, 0, None, button_title)
                        time.sleep(0.5)
                        win32gui.SendMessage(button_hwnd, win32con.BM_CLICK, 0, 0)
                        time.sleep(1)
                        if is_exist_window():
                            win32gui.SendMessage(button_hwnd, win32con.BM_CLICK, 0, 0)
                time.sleep(1)
            except:
                print(traceback.format_exc())
        else:
            time.sleep(0.1)


t = threading.Thread(target=deal_sign_window, args=(), daemon=True)
t.start()

time.sleep(1)
g = input("按回车键继续...")
