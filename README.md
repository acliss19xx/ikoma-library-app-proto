# ikoma-library-app-proto

### ���[�J��PC�ł̓���m�F�����\�z����菇

* `node`��`npm`��`git`���C���X�g�[�����Ă�������
   * Node.js
      * https://nodejs.org/en/download/
   * Git
      * https://git-scm.com/downloads
   * �m�F����ɂ̓V�F���ňȉ��̂悤�Ɋm�F���Ă�������

```
$ node --version
v6.3.0

$ npm --version
3.10.3

$ git --version
git version 1.7.9.5
```

* �ŐV�̃\�[�X�c���[���擾���܂�

```
$ git clone https://github.com/hiroaki-ohkawa/ikoma-library-app-proto.git
```

* ���s�ɕK�v�ȃ��C�u���������擾���܂�

```
$ cd ikoma-library-app-proto
$ npm install
```

* ���ϐ���ݒ肵�܂�
   * �y�V�E�F�u�T�[�r�X�̃A�v��ID��ݒ肵�܂�
   * �A�v��ID�͊e���Ŏ擾���Ă�������
   * �A�v��ID��`routes/api/v1.js`�ŎQ�Ƃ���܂�

```
(Windows)
# set RAKUTEN_APP_ID=XXXXXXXXXXXXXXXXXXX

(Linux)
$ export RAKUTEN_APP_ID=XXXXXXXXXXXXXXXXXXX
```

* Web�A�v�����N�����܂�

```
$ ./bin/www
```

```
�u���E�U�ŉ��L����
http://localhost:3000/
```