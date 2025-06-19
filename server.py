#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import ssl
import time
import json
import hashlib
import asyncio
import websockets
import threading
import traceback
import win32gui
import win32con
import configparser
from pywinauto import Application, Desktop


if hasattr(sys, 'frozen'):
    current_path = os.path.dirname(sys.executable)
else:
    current_path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(current_path, 'config.conf')
file_path = os.path.join(current_path, 'files')
cfg = configparser.ConfigParser()
cfg.read(config_path, encoding='utf-8')
listen_port = int(cfg.get('default', 'PORT', fallback=0))
is_windows = int(cfg.get('default', 'IS_WINDOW', fallback=0))
window_title = cfg.get('default', 'WINDOW_TITLE', fallback='')
button_title = cfg.get('default', 'WINDOW_CONFIRM', fallback='')
sign_pwd = cfg.get('default', 'WINDOW_INPUT_TEXT', fallback='')
edit_index = int(cfg.get('default', 'WINDOW_EDIT_INDEX', fallback=0))


def is_open_window():
    try:
        windows = Desktop().windows()
        return any(window.window_text() == window_title for window in windows)
    except:
        return False


def is_exist_window():
    hwnd = win32gui.FindWindow(None, window_title)
    return hwnd != 0


def deal_sign_window():
    while True:
        if is_open_window():
            try:
                print('Windows is found ~')
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


async def handle_connection(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 1:
                fileName = os.path.join(current_path, data['name'])
            else:
                fileName = os.path.join(file_path, data['name'])
            abs_file_path = os.path.abspath(fileName)
            if not abs_file_path.startswith(current_path):
                await websocket.send("错误: 未授权的访问")
                continue
            if not os.path.exists(fileName):
                await websocket.send(f"错误: 文件 {data['name']} 不存在")
                continue

            try:
                with open(fileName, "rb") as file:
                    file_content = file.read()
                file_hash = hashlib.sha256(file_content).hexdigest()
                file_size = len(file_content)
                metadata = {"type": "metadata", "size": file_size, "hash": file_hash}
                await websocket.send(json.dumps(metadata))

                chunk_size = 1024 * 64  # 每次发送 64KB
                for i in range(0, len(file_content), chunk_size):
                    chunk = file_content[i:i + chunk_size]
                    await websocket.send(chunk)
                await websocket.send("FILE_TRANSFER_COMPLETE")
                print(f"文件 {data['name']} 传输完成")
            except Exception as e:
                await websocket.send(f"错误: 无法读取文件 ({str(e)})")
    except websockets.exceptions.ConnectionClosed:
        print("客户端断开连接")


if (is_windows == 1):
    t = threading.Thread(target=deal_sign_window, daemon=True)
    t.start()


# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
# ssl_context.verify_mode = ssl.CERT_NONE
# ssl_context.minimum_version = ssl.TLSVersion.TLSv1_2

async def main():
    start_server = await websockets.serve(handle_connection, host="127.0.0.1", port=listen_port)   # , ssl=ssl_context)
    await start_server.wait_closed()

asyncio.run(main())
