using System;
using System.Drawing;
using System.Windows.Forms;
using System.IO;

namespace QuantumBrowser
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new QuantumBrowserForm());
        }
    }

    public class QuantumBrowserForm : Form
    {
        private WebBrowser browser;
        private TextBox urlBox;
        private Button backBtn, forwardBtn, reloadBtn;
        private Panel navPanel;

        public QuantumBrowserForm()
        {
            this.Text = "Quantum Browser - Powered by Mozilla Gecko";
            this.Size = new Size(1280, 800);
            this.MinimumSize = new Size(640, 480);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(15, 4, 34); // #0f0422 violet UI theme

            string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logo.ico");
            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            // Navigation Toolbar
            navPanel = new Panel();
            navPanel.Dock = DockStyle.Top;
            navPanel.Height = 44;
            navPanel.BackColor = Color.FromArgb(19, 9, 36);

            backBtn = new Button { Text = "◀", Width = 36, Height = 28, Top = 8, Left = 8, ForeColor = Color.White, FlatStyle = FlatStyle.Flat };
            backBtn.FlatAppearance.BorderSize = 0;
            backBtn.Click += (s, e) => { if (browser.CanGoBack) browser.GoBack(); };

            forwardBtn = new Button { Text = "▶", Width = 36, Height = 28, Top = 8, Left = 48, ForeColor = Color.White, FlatStyle = FlatStyle.Flat };
            forwardBtn.FlatAppearance.BorderSize = 0;
            forwardBtn.Click += (s, e) => { if (browser.CanGoForward) browser.GoForward(); };

            reloadBtn = new Button { Text = "↻", Width = 36, Height = 28, Top = 8, Left = 88, ForeColor = Color.White, FlatStyle = FlatStyle.Flat };
            reloadBtn.FlatAppearance.BorderSize = 0;
            reloadBtn.Click += (s, e) => browser.Refresh();

            urlBox = new TextBox
            {
                Top = 9,
                Left = 132,
                Width = 800,
                Height = 26,
                BackColor = Color.FromArgb(35, 19, 70),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 10)
            };
            urlBox.Text = "https://www.google.com";
            urlBox.KeyDown += (s, e) =>
            {
                if (e.KeyCode == Keys.Enter)
                {
                    Navigate(urlBox.Text);
                    e.SuppressKeyPress = true;
                }
            };

            navPanel.Controls.Add(backBtn);
            navPanel.Controls.Add(forwardBtn);
            navPanel.Controls.Add(reloadBtn);
            navPanel.Controls.Add(urlBox);

            // Browser Engine Viewport
            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScriptErrorsSuppressed = true;
            browser.Navigated += (s, e) => { if (browser.Url != null) urlBox.Text = browser.Url.ToString(); };

            this.Controls.Add(browser);
            this.Controls.Add(navPanel);

            this.Resize += (s, e) => { urlBox.Width = Math.Max(200, this.ClientSize.Width - 160); };

            Navigate("https://www.google.com");
        }

        private void Navigate(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return;
            string target = input.Trim();
            if (!target.StartsWith("http://") && !target.StartsWith("https://"))
            {
                if (target.Contains(".") && !target.Contains(" "))
                    target = "https://" + target;
                else
                    target = "https://www.google.com/search?q=" + Uri.EscapeDataString(target);
            }
            try { browser.Navigate(target); } catch { }
        }
    }
}
