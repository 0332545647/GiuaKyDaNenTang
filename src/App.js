import React, { useState, useEffect } from 'react';
import { Share } from '@capacitor/share';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';
import './App.css';

function App() {
  const [birthDate, setBirthDate] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [batteryInfo, setBatteryInfo] = useState('');

  // Bonus: Lấy thông tin pin
  const getBatteryInfo = async () => {
    try {
      const info = await Device.getBatteryInfo();
      setBatteryInfo(`Pin: ${Math.floor(info.batteryLevel * 100)}%`);
    } catch (error) {
      console.error('Không thể lấy thông tin pin', error);
      setBatteryInfo('Không hỗ trợ xem pin trên thiết bị này');
    }
  };

  useEffect(() => {
    getBatteryInfo();
  }, []);

  const calculateDaysLeft = () => {
    if (!birthDate) return;

    const [day, month] = birthDate.split('/').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    
    let nextBirthday = new Date(currentYear, month - 1, day);
    
    if (today > nextBirthday) {
      nextBirthday = new Date(currentYear + 1, month - 1, day);
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysLeft(diffDays);
    showNotification(diffDays);
  };

  const showNotification = async (days) => {
    await LocalNotifications.requestPermissions();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Đếm ngược sinh nhật",
          body: `Còn ${days} ngày nữa đến sinh nhật của bạn!`,
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });
  };

  const shareResult = async () => {
    if (!daysLeft) return;
    
    await Share.share({
      title: 'Đếm ngược sinh nhật',
      text: `Còn ${daysLeft} ngày nữa là đến sinh nhật của tôi! 🎉`,
      url: 'https://example.com',
      dialogTitle: 'Chia sẻ đếm ngược',
    });
  };

  return (
    <div className="birthday-countdown-app">
      <h1 className="app-title">Đếm ngược sinh nhật</h1>
      
      <div className="birthday-input__container">
        <input
          type="text"
          placeholder="Nhập ngày sinh (dd/mm)"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="birthday-input__field"
        />
      </div>
      
      <button onClick={calculateDaysLeft} className="birthday-countdown__button birthday-countdown__button--calculate">
        Tính ngày còn lại
      </button>
      
      {daysLeft !== null && (
        <div className="birthday-result__container">
          <h2 className="birthday-result__text">Còn {daysLeft} ngày đến sinh nhật của bạn!</h2>
          <button onClick={shareResult} className="birthday-countdown__button birthday-countdown__button--share">
            Chia sẻ kết quả
          </button>
        </div>
      )}
      
      {/* Bonus: Hiển thị trạng thái pin */}
      <div className="device-info__battery">
        {batteryInfo}
      </div>
    </div>
  );
}

export default App;