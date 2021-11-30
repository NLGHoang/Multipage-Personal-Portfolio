// 1. Lấy ra form element
// 2. Lọc qua rules lấy ra từng cái rule
// 3. Từ rule lấy ra thẻ input element
// 4. Khi mà inputElement mà có thì lắng nghe sự kiện Blur 
//      4.1 => lấy ra được value => inputElement.value
//      4.2 => lấy ra được test func => rule.test()
// 5. Xuống rule viết test
// 6. Tiếp tục ở sự kiện Blur : tạo biến và truyền value vào rule.test()
// 7. Tìm thẻ cha của input chứa lỗi. => từ thẻ cha select tới thẻ span hiển thị lỗi
// 8. Tạo hàm Validate để valid lỗi
// 9. Tạo hàm onInput để khi input vào sẽ mất lỗi
// ...
// 10. tao bien luu tat ca cac rule de khong bi ghi de : selectorRules
// 11. Ở chổ lọc ra rule -> Nếu nó là array thì push giá trị rule.test vào, ngược lại gán nó là array [rule.test]
// 12. Ở hàm validate. lập qua từng rule nếu có lỗi thì dừng 
// 13. Ở formElement, thêm sự kiện onsubmit, ngăn cản trường hợp mặc định
// 14. Khi bấm submit phải lấy ra tất cả dữ liệu người dùng nhập vào
// 15. Nếu không có lỗi thì mới lấy ra toàn bộ thông tin => kiểm tra xem có lỗi hay không
// 16. Nếu không có lỗi. thì lấy ra tất cả thẻ input có attribute là name.
function Validator(options) {
    // 10. tao bien luu tat ca cac rule de khong bi ghi de
    var selectorRules = {};

    // 7. Tìm thẻ cha của input chứa lỗi.
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // 8. Tạo hàm Validate để valid lỗi
    function Validate(inputElement, rule) {
        var getP = getParent(inputElement, options.formGroupElement);
        // từ thẻ cha tìm tới thẻ span hiển thị lỗi
        var errorElement = getP.querySelector(options.errorSelector);
        // 6. Tiếp tục ở sự kiện Blur : tạo biến và truyền value vào rule.test()
        var errorMessage;

        // 12. Ở hàm validate. lập qua từng rule nếu có lỗi thì dừng 
        var rules = selectorRules[rule.selector];
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector+ ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getP.classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getP.classList.remove('invalid');
        }

        return !errorMessage; // có lỗi(true) -> !có lỗi => false
    }

    // 9. Tạo hàm onInput để khi input vào sẽ mất lỗi
    function onInput(inputElement) {
        var getP = getParent(inputElement, options.formGroupElement);
        // từ thẻ cha tìm tới thẻ span hiển thị lỗi
        var errorElement = getP.querySelector(options.errorSelector);

        errorElement.innerText = '';
        getP.classList.remove('invalid');
    }
    //1. Lấy ra form Element
    var formElement = document.querySelector(options.form);

    if(formElement) {

        // 13. Ở formElement, thêm sự kiện onsubmit, ngăn cản trường hợp mặc định
        formElement.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true; // true: không có lỗi

            // 15. Nếu không có lỗi thì mới lấy ra toàn bộ thông tin => kiểm tra xem có lỗi hay không
            // Lặp qua từng rules và validate
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = Validate(inputElement, rule); // false
                if(!isValid) { //true => có lỗi
                    isFormValid = false; // =>false: có lỗi
                }
            });

            // 16. Nếu không có lỗi. thì lấy ra tất cả thẻ input có attribute là name.
            if(isFormValid) {
                if( typeof options.onSubmit == 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                if(input.matches(':checked')) {
                                    values[input.name] = input.value;
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;
                            case 'checkbox':
                                if(input.matches(':checked')) {
                                    if(!Array.isArray(values[input.name])) {
                                        values[input.name] = [];
                                    } 
                                    values[input.name].push(input.value);
                                } else if (!values[input.name]) {
                                    values[input.name] = '';
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default: 
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);


                } else {
                    inputElement.onsubmit();
                }
            }
        };

        // 2. Lọc qua rules lấy ra từng cái rule
        options.rules.forEach((rule) => {
            // 11. Ở chổ lọc ra rule -> Nếu nó là array thì push giá trị rule.test vào, ngược lại gán nó là array [rule.test]
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            // 3.Từ rule lấy ra thẻ input element
            var inputElements = formElement.querySelectorAll(rule.selector);
            
            Array.from(inputElements).forEach((inputElement) => {
                if(inputElement) {
                    inputElement.onblur = () => {
                        // 4.1. value => inputElement.value
                        // 4.2. test func => rule.test()
                        Validate(inputElement, rule);
                    };

                    inputElement.oninput = () => {
                        onInput(inputElement);
                    };
                }
            });
    
        });
        
    }

}

// Định nghĩa các rules
// Nguyên tắc của các rules do mình đặt ra:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefined)

Validator.isRequired = (selector, message) => {
    return {
        selector,
        // 5. Xuống rule viết test
        test: (value) => {
            if(selector.includes('#')) {
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này!';
            } else {
                return value ? undefined : message || 'Vui lòng nhập trường này!';
            }
        }
    };
};

Validator.isEmail = (selector, message) => {
    return {
        selector,
        test: (value) => {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email!';
        }
    };
};

Validator.minLength = (selector, min, message) => {
    return {
        selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự!`;
        }
    };
};

Validator.isConfirm = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
};