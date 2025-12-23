import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';
import { getTheme } from '../themes/categories';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function ThankYouCard({ album, className = '' }) {
  const theme = getTheme(album?.category || 'weddings');
  
  const downloadCard = async () => {
    try {
      const element = document.getElementById('thank-you-card');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });
      
      const link = document.createElement('a');
      link.download = `thank-you-card-${album?.names?.replace(/[^a-zA-Z0-9]/g, '-') || 'album'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Thank you card downloaded!');
    } catch (error) {
      console.error('Failed to download card:', error);
      toast.error('Failed to download card');
    }
  };

  if (!album) return null;

  return (
    <div className={`thank-you-card-container ${className}`}>
      <motion.div
        id="thank-you-card"
        className="postcard-container group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: theme.colors.background,
        }}
      >
        <div 
          className="postcard"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.primary}20 100%)`,
            borderColor: theme.colors.primary,
          }}
        >
          {/* Left side - Featured photo */}
          <div className="postcard-photo">
            {album.photos?.[0] ? (
              <img 
                src={typeof album.photos[0] === 'string' ? album.photos[0] : album.photos[0].url} 
                alt={`${album.names} album`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: theme.colors.background }}
              >
                <span className="text-6xl opacity-60">{theme.decorations.pattern === 'floral' ? '🌸' : '💝'}</span>
              </div>
            )}
          </div>

          {/* Right side - Thank you message */}
          <div 
            className="postcard-content"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.primary}10 100%)`,
            }}
          >
            <div className="relative h-full flex flex-col">
              {/* Thank You title */}
              <div className="mb-4">
                <h2 
                  className="font-serif text-2xl md:text-4xl lg:text-5xl font-semibold mb-2"
                  style={{ 
                    color: theme.colors.text,
                    fontFamily: theme.fonts.display 
                  }}
                >
                  Thank You
                </h2>
              </div>

              {/* Message */}
              <div className="flex-1 mb-6">
                <p 
                  className="postcard-message"
                  style={{ 
                    color: theme.colors.text,
                    fontFamily: theme.fonts.serif 
                  }}
                >
                  {album.category === 'weddings' 
                    ? "For being here on our wedding day, you helped make it truly unforgettable for us. We hope you enjoyed it as much as we did."
                    : album.category === 'family'
                    ? "Thank you for being part of our family's special moments. Your presence made these memories even more precious."
                    : album.category === 'celebrations'
                    ? "Thanks for celebrating with us! Your energy and joy made this party absolutely amazing."
                    : album.category === 'travel'
                    ? "Thank you for following our adventure! These memories wouldn't be the same without sharing them with you."
                    : album.category === 'special'
                    ? "Thank you for making this special occasion even more memorable. Your presence meant the world to us."
                    : "Thank you for being part of our creative journey. Your support and encouragement inspire us every day."
                  }
                </p>
              </div>

              {/* Signature and QR */}
              <div className="flex items-end justify-between">
                <div>
                  <p 
                    className="postcard-signature"
                    style={{ 
                      color: theme.colors.text,
                      fontFamily: theme.fonts.display 
                    }}
                  >
                    {album.names}
                  </p>
                  <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                    <span style={{ color: theme.colors.text }}>
                      {new Date(album.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div 
                  className="qr-code-enhanced"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, white 100%)`,
                    borderColor: theme.colors.primary,
                  }}
                >
                  <QRCodeCanvas value={album.url} size={64} includeMargin={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.button
        onClick={downloadCard}
        className="mt-4 btn-primary flex items-center gap-2 mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download className="w-4 h-4" />
        Download Thank You Card
      </motion.button>
    </div>
  );
}