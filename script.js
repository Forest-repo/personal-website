// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 导航功能
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');

    // 导航高亮
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${id}`) {
                        item.classList.add('active');
                    }
                });

                // 如果是关于我部分，触发技能动画
                if (id === 'about') {
                    const skillItems = document.querySelectorAll('.skills ul li');
                    skillItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 200); // 每个技能项依次显示
                    });
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => {
        observer.observe(section);
    });

    // 平滑滚动
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 滚动进度条
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;

        // 导航栏背景效果
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 添加淡入动画
    const fadeInElements = document.querySelectorAll('.hero-content h1, .hero-content p, .social-links');
    fadeInElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // 移动端菜单切换
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(menuToggle);

    menuToggle.addEventListener('click', () => {
        const sideNav = document.querySelector('.side-nav');
        sideNav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // 导航栏切换功能
    const navToggle = document.querySelector('.nav-toggle');
    const body = document.body;

    navToggle.addEventListener('click', () => {
        body.classList.toggle('nav-hidden');
    });

    // 技能标签动画
    const skillItems = document.querySelectorAll('.skills ul li');
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 200); // 每个标签延迟200ms出现
    });

    // 按钮点击波纹效果
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 表单验证实现
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('请填写所有必填字段！');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('请输入有效的邮箱地址！');
                return;
            }
            
            alert('表单提交成功！我们会尽快回复您。');
            contactForm.reset();
        });
    }

    // 添加动画效果
    const animateElements = () => {
        const elements = document.querySelectorAll('.animate');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight * 0.8 && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', animateElements);
    animateElements(); // 初始检查

    // 打字机效果实现
    const typedText = document.querySelector('.typed-text');
    const cursor = document.querySelector('.cursor');
    const textArray = ["前端开发工程师", "后端开发工程师", "全栈工程师", "机器学习工程师"];
    let textArrayIndex = 0;
    let charIndex = 0;

    // 打字效果的定时器函数
    const type = () => {
        if (charIndex < textArray[textArrayIndex].length) {
            if(!cursor.classList.contains("typing")) cursor.classList.add("typing");
            typedText.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, 200);
        } else {
            cursor.classList.remove("typing");
            setTimeout(erase, 2000);
        }
    }

    // 删除文本的定时器函数
    const erase = () => {
        if (charIndex > 0) {
            if(!cursor.classList.contains("typing")) cursor.classList.add("typing");
            typedText.textContent = textArray[textArrayIndex].substring(0, charIndex-1);
            charIndex--;
            setTimeout(erase, 100);
        } else {
            cursor.classList.remove("typing");
            textArrayIndex++;
            if(textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, 1000);
        }
    }

    // 开始第一轮打字动画
    setTimeout(type, 1500);
});
